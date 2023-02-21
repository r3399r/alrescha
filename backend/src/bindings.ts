import { S3 } from 'aws-sdk';
import { Container } from 'inversify';
import 'reflect-metadata';
import { DbAccess } from './access/DbAccess';
import { ChatService } from './logic/ChatService';
import { PredictService } from './logic/PredictService';
import { Database } from './util/Database';

const container: Container = new Container();

container.bind<Database>(Database).toSelf().inSingletonScope();

// bind repeatedly for db entities
// container.bind<Function>(dbEntitiesBindingId).toFunction(TreasureEntity);

// db access for tables
container.bind<DbAccess>(DbAccess).toSelf();

// service
container.bind<ChatService>(ChatService).toSelf();
container.bind<PredictService>(PredictService).toSelf();

// AWS
container.bind<S3>(S3).toDynamicValue(() => new S3());

export { container as bindings };
