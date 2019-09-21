import * as functions from 'firebase-functions';
import { db } from './init';
const path =    require('path');
const os =      require('os');
const mkdirp =  require('mkdirp-promise');
const spawn =   require('child-process-promise').spawn;
const rimraf =  require('rimraf');

const { Storage } = require('@google-cloud/storage');
const gcs = new Storage();

export const resizeThumbnail = functions.storage.object()
  .onFinalize(async (object, context) => {

    const fileFullPath = object.name || '';
    const contentType = object.contentType || '';
    const fileDir = path.dirname(fileFullPath);
    const fileName = path.basename(fileFullPath);
    const tempLocalDir = path.join(os.tmpdir(), fileDir);

    console.log('Thumbnail generation started: ', fileFullPath, fileDir, fileName, contentType);

    // Quit if not image or the image has already been turned into a thumbnail
    if (!contentType.startsWith('image/') || fileName.startsWith('thumb_')) {
      console.log('Exiting image processing.');
      return null;
    }


    // Get original file and location
    await mkdirp(tempLocalDir);

    const bucket = gcs.bucket(object.bucket);

    const originalImageFile = bucket.file(fileFullPath);

    const tempLocalFile = path.join(os.tmpdir(), fileFullPath);

    await originalImageFile.download({destination: tempLocalFile});


    // Generate a thumbnail using ImageMagick
    const outputFilePath = path.join(fileDir, 'thumb_' + fileName);

    const outputFile = path.join(os.tmpdir(), outputFilePath);

    console.log('Generating thumnail at: ', outputFile);

    await spawn('convert', [tempLocalFile, '-thumbnail', '510X287 >', outputFile], { capture: ['stdout', 'stderr'] });


    // Upload the Thumbnail back to storage
    const metadata = {
      contentType: object.contentType,
      cacheControl: 'public,max-age=2592000, s-maxage=2592000'
    };

    console.log('Uploading the thumbnail to storage:', outputFile, outputFilePath);

    const uploadedFiles = await bucket.upload(outputFile, { destination: outputFilePath, metadata });


    // Delete local files
    rimraf.sync(tempLocalDir);

    await originalImageFile.delete();


    // Create link to uploaded thumbnail
    const thumbnail = uploadedFiles[0];

    const url = await thumbnail.getSignedUrl({ action: 'read', expires: new Date(3000,0,1) });

    console.log('Generated signed url:', url);


    // Save the thumbnail link in the database
    const frags = fileFullPath.split('/');
    const courseId = frags[1];

    console.log('Saving url to database: ' + courseId);

    return db.doc(`courses/${ courseId }`).update({ uploadedImageUrl: url });

  });
