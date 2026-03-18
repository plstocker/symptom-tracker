import Dexie from 'dexie'

export const db = new Dexie('symptom-tracker')

db.version(1).stores({
  logs: '++id, ts, tabName',
  tabs: '++id, order',
})

db.open()
  .then(() => console.log('db opened successfully'))
  .catch(err => console.log('db open error:', err))