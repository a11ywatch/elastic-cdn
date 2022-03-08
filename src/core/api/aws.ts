/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { S3 } from "aws-sdk";
import fs from "fs";
import { Response } from "express";
import { DEV, BUCKET_NAME } from "../../config";

let s3bucket: S3;

if (BUCKET_NAME) {
  s3bucket = new S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
  });
}

export function getAWSFile(Key?: string, res?: Response, download?: boolean) {
  const params = { Bucket: BUCKET_NAME, Key };
  try {
    if (s3bucket) {
      s3bucket.headObject(params, function (err) {
        if (err?.code === "NotFound") {
          res.sendStatus(404);
        } else {
          const stream = s3bucket.getObject(params).createReadStream();

          if (download) {
            res.attachment(Key);
          }
          stream.pipe(res);
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export function uploadToS3(
  Body: any,
  Key: string,
  fsPath: string,
  ContentType?: string
): void {
  try {
    if (s3bucket) {
      s3bucket.upload(
        {
          Bucket: BUCKET_NAME,
          Key,
          Body,
          ACL: "public-read",
          ContentType,
          ContentDisposition:
            ContentType === "text/javascript" ? "inline" : undefined,
        },
        (err, data) => {
          if (err) {
            console.error("ERROR: ", err);
          } else {
            console.log("UPLOADED: ", data);
            if (!DEV) {
              fs.unlinkSync(fsPath);
            }
          }
        }
      );
    }
  } catch (e) {
    console.error(e);
  }
}
