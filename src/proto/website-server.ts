import { Server, ServerCredentials } from "@grpc/grpc-js";
import { getProto } from "./website";
import { GRPC_PORT, GRPC_HOST } from "../config/rpc";
import { addScriptSource } from "../core/api";

let server: Server;

export const createServer = async () => {
  const websiteProto = await getProto();
  server = new Server();
  server.addService(websiteProto.WebsiteService.service, {
    // get alt tag for the image
    addScript: (call, callback) => {
      setImmediate(async () => {
        await addScriptSource(call.request);
      });
      callback(null, {});
    },
  });
  server.bindAsync(GRPC_HOST, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`gRPC server running at http://0.0.0.0:${GRPC_PORT}`);
  });
};

export const killServer = async () => {
  const websiteProto = await getProto();
  server.removeService(websiteProto.WebsiteService.service);
  server.forceShutdown();
};