import { load } from "@grpc/proto-loader";
import { loadPackageDefinition } from "@grpc/grpc-js";
import type {
  GrpcObject,
  Client,
  ServiceClientConstructor,
  ProtobufTypeDefinition,
} from "@grpc/grpc-js";

type GRPC = GrpcObject | ServiceClientConstructor | ProtobufTypeDefinition;

// the generic unwrapping of the gRPC service
type RpcService = typeof Client & {
  service?: any;
};

export interface Service {
  Cdn?: RpcService;
  health?: {
    HealthCheck?: RpcService;
  };
}

export const getProto = async (
  target = "/cdn.proto"
): Promise<Service & GRPC> => {
  const packageDef = await load(`node_modules/@a11ywatch/protos${target}`, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return loadPackageDefinition(packageDef);
};
