import { createReadStream, createWriteStream } from "fs";
import { minify } from "@swc/core";
import { directoryExist } from "../../utils";
import { uploadToS3 } from "./aws";

export const addScript = ({ req, res }) => {
  setImmediate(async () => {
    try {
      const { scriptBuffer, cdnSourceStripped, domain } = req.body;

      if (cdnSourceStripped && scriptBuffer) {
        const srcPath = `src/scripts/${domain}/${cdnSourceStripped}`;
        const awsPath = srcPath.substring(4);
        const cdnFileName = `${srcPath}.js`;
        const cdnFileNameMin = `${srcPath}.min.js`;
        const dirExist = directoryExist(cdnFileName);

        if (dirExist) {
          const writeStream = createWriteStream(cdnFileName);
          const writeStreamMinified = createWriteStream(cdnFileNameMin);

          const newScriptBuffer = Buffer.from(scriptBuffer);

          // MOVE MINIFY TO QUEUE
          const output = await minify(scriptBuffer, { mangle: false });
          const { code } = output;
          const minBuffer = Buffer.from(code);
          // TODO: LOOK INTO ALTERNATIVE
          writeStream.write(newScriptBuffer, "base64");
          writeStreamMinified.write(minBuffer, "base64");

          // when file stored send to AWS -> then delete file TODO: MOVE TO BUFFER HANDLING
          writeStream.on("finish", () => {
            uploadToS3(
              createReadStream(cdnFileName),
              `${awsPath}.js`,
              cdnFileName,
              "text/javascript"
            );
          });

          writeStreamMinified.on("finish", () => {
            uploadToS3(
              createReadStream(cdnFileNameMin),
              `${awsPath}.min.js`,
              cdnFileNameMin,
              "text/javascript"
            );
          });

          writeStream.end();
          writeStreamMinified.end();
        }
      }
    } catch (e) {
      console.log(e);
    }
  });

  res.send(true);
};
