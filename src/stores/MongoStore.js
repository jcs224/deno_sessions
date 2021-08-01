import { MongoClient } from "https://deno.land/x/mongo@v0.23.1/mod.ts";

export default class MongoStore {
  constructor(options) {
    this.uri = options.uri || "mongodb://127.0.0.1:27017";
    this.collection = options.collection || "sessions";
    this.connOptions = options.connectionOptions ||
      ({ useNewUrlParser: true, useUnifiedTopology: true });
    this.databaseName = options.databaseName || null;
    this.db = null;
  }
  async init() {
    this.client = new MongoClient();

    await this.client.connect(this.uri, this.connOptions);

    this.db = this.databaseName == null
      ? this.client.database()
      : this.client.database(this.databaseName);
  }

  async sessionExists(sessionId) {
    const session = await this.db.collection(this.collection).findOne({
      sessionid: sessionId,
    });
    return session ? true : false;
  }

  async getSessionById(sessionId) {
    const value = (await this.db.collection(this.collection).findOne({
      sessionid: sessionId,
    })).data;
    return value;
  }

  async createSession(sessionId) {
    await this.db.collection(this.collection).insert({
      sessionid: sessionId,
      data: { "_flash": {} },
    });
  }

  async persistSessionData(sessionId, sessionData) {
    console.log(sessionData.data);
    await this.db.collection(this.collection).updateOne({
      sessionid: sessionId,
    }, { $set: { data: sessionData } });
  }

  async destroySession(sessionId) {
    await this.db.collection(this.collection).deleteOne({
      sessionid: sessionId,
    });
  }
}
