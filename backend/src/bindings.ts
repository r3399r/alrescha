import { S3 } from 'aws-sdk';
import { Container } from 'inversify';
import 'reflect-metadata';
import { DbAccess } from './access/DbAccess';
import { ImageAccess } from './access/ImageAccess';
import { UserAccess } from './access/UserAccess';
import { ViewUserAccess } from './access/ViewUserAccess';
import { ChatService } from './logic/ChatService';
import { PredictService } from './logic/PredictService';
import { ImageEntity } from './model/db/ImageEntity';
import { UserEntity } from './model/db/UserEntity';
import { ViewUserEntity } from './model/db/ViewUserEntity';
import { Database, dbEntitiesBindingId } from './util/Database';

const container: Container = new Container();

container.bind<Database>(Database).toSelf().inSingletonScope();

// bind repeatedly for db entities
container.bind<Function>(dbEntitiesBindingId).toFunction(ImageEntity);
container.bind<Function>(dbEntitiesBindingId).toFunction(UserEntity);
container.bind<Function>(dbEntitiesBindingId).toFunction(ViewUserEntity);

// db access for tables
container.bind<DbAccess>(DbAccess).toSelf();
container.bind<ImageAccess>(ImageAccess).toSelf();
container.bind<UserAccess>(UserAccess).toSelf();
container.bind<ViewUserAccess>(ViewUserAccess).toSelf();

// service
container.bind<ChatService>(ChatService).toSelf();
container.bind<PredictService>(PredictService).toSelf();

// AWS
container.bind<S3>(S3).toDynamicValue(() => new S3());

export { container as bindings };
