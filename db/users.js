// user records to be checked
const records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ] }
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
  ];

// two functions required by passport-local.Strategy and deserializeUser
exports.findByUsername = (username, callback)=>{
    const record = records.find(record=> record.username === username)||null;
    return callback(null,record);
}

exports.findById = (id, callback)=>{
    const record = records.find(record=> record.id === id)||null;
    if(!record) callback(new Error("User " + id + " does not exist"));
    return callback(null,record);
}