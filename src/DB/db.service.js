export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
}) => {
  return await model.create(data, options);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = {},
}) => {
  return await model.find(filter).select(select).populate(populate);
};

export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return model.findOne(filter).select(select).populate(populate);
};

// db.service.js
export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  select = "",
  populate = [],
  options = {runValidators:true , new: true},
}) => {
  return await model.findOneAndUpdate(filter,{ ...data , $inc:{__v:1}}, options).select(select).populate(populate)
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = {runValidators:true},
}) => {
  return await model.updateOne(filter, data, options);
};


export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  return model.findById(id).select(select).populate(populate);
};

// للبحث مع الترتيب والتصفح
export const findDocuments = async ({
  model,
  filter = {},
  sort = {},
  skip = 0,
  limit = 10,
  select = "",
}) => {
  return await model
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(select);
};

export const findOneAndReplace = async ({
  model,
  filter = {},
  replacement = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  return model
    .findOneAndReplace(filter, replacement, { new: true, ...options })
    .select(select)
    .populate(populate);
};

export const findByIdAndUpdate = async ({
  model,
  id,
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  return model
    .findByIdAndUpdate(id, data, { new: true, ...options })
    .select(select)
    .populate(populate);
};

export const findByIdAndDelete = async ({ model, id }) => {
  return await model.findByIdAndDelete(id);
};

export const findOneAndDelete = async ({ model, filter }) => {
  return await model.findOneAndDelete(filter);
};

export const deleteOne = async ({ model, filter={} ={}}) => {
  return await model.deleteOne(filter);
};

export const updateMany = async ({ model, filter, data }) => {
  return await model.updateMany(filter, data);
};

export const deleteMany = async ({ model, filter = {} } = {}) => {
  return model.deleteMany(filter);
};

// لحساب عدد المستندات
export const countDocuments = async ({ model, filter = {} }) => {
  return await model.countDocuments(filter);
};

export const aggregate = async ({ model, pipeline }) => {
  return await model.aggregate(pipeline);
};
