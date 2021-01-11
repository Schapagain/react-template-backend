


const queryDatabase = async ({model,query,attributes}) => {
    return model.find(query);
  }
  
module.exports = {
  queryDatabase
}