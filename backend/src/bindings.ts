import { Container } from 'inversify';
import 'reflect-metadata';
import { DbAccess } from './access/DbAccess';
import { ChatService } from './logic/ChatService';
import { Database } from './util/Database';

const container: Container = new Container();

container.bind<Database>(Database).toSelf().inSingletonScope();

// bind repeatedly for db entities
// container.bind<Function>(dbEntitiesBindingId).toFunction(TreasureEntity);

// db access for tables
container.bind<DbAccess>(DbAccess).toSelf();

// service
container.bind<ChatService>(ChatService).toSelf();

export { container as bindings };
