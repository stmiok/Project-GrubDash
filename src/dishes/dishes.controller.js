const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// retrieve all existing dishes
function list(req, res) {
  res.json({ data: dishes });
}

// retrieve dish
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// check if dish exists
function dishExists(req, res, next) {
  let dishId = req.params.dishId;
  let foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

// create dish
function create(req, res) {
  const dish = req.body.data;
  dish.id = nextId();
  dishes.push(dish);
  res.status(201).json({ data: dish });
}

// delete dish
function destroy(req, res, next) {
  let { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === Number(dishId));
  if (index > -1) {
    dishes.splice(index, 1);
    res.send(204).send();
  } else {
    next({
      status: 404,
      message: "An order cannot be deleted unless it is pending.",
    });
  }
}

// id validation
function validateId(req, res, next) {
  const { dishId } = req.params;
  const {
    data: { id },
  } = req.body;
  if (dishId === id || id === undefined || id === null || !id) {
    return next();
  } else {
    next({
      status: 400,
      message: `id: ${id}`,
    });
  }
}

// name validation
function validateName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must include a name.",
    });
  }
}

// description validation
function validateDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description !== "") {
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must include a description.",
    });
  }
}

// price validation
function validatePrice(req, res, next) {
  const {
    data: { price },
  } = req.body;
  if (typeof price === "number" && !isNaN(price) && price > 0) {
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must include a price.",
    });
  }
}

// image validation
function validateImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url !== "") {
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must include a image_url.",
    });
  }
}

// update existing dish
function update(req, res, next) {
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  const { dishId } = req.params;
  if (id && dishId !== id) {
    return next({
      status: 400,
      message: `Dish id ${id} does not match route id ${dishId}.`,
    });
  }
  res.locals.dish = {
    ...res.locals.dish,
    name,
    description,
    price,
    image_url,
  };
  res.json({ data: res.locals.dish });
}

module.exports = {
  create: [
    validateName,
    validateDescription,
    validatePrice,
    validateImage,
    create,
  ],
  delete: [dishExists, destroy],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    validateId,
    validateName,
    validateDescription,
    validatePrice,
    validateImage,
    update,
  ],
};
