const PROPERTY = require("../models/property");

const createProperty = async (req, res) => {
  res.send("create property");
};

const getLandlordsProperties = async (req, res) => {
  const { userId } = req.user;
  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    const properties = await PROPERTY.find({ landlord: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const [total, availableProperties, rentedProperties] = await Promise.all([
      PROPERTY.countDocuments({ landlord: userId }),
      PROPERTY.countDocuments({ landlord: userId, availability: "available" }),
      PROPERTY.countDocuments({ landlord: userId, availability: "rented" }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      availableProperties,
      rentedProperties,
      properties,
      currentPage: parseInt(page),
      totalPages,
      properties,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { availability } = req.body;
  try {
    const property = await PROPERTY.findById(propertyId);
    property.availability = availability;
    await property.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//find() // num of pages lagos surulere lagosLagos 5000 lte
const getAllProperties = async (req, res) => {
  const { page = 1, location, budget, type } = req.query;
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const filter = {
      availability: "available",
    };
    if (location) {
      filter.location = { $regex: location, $options: "i" }; // case-insensitive search
    }
    if (budget) {
      filter.price = { $lte: parseInt(budget) }; // filter by budget
    }
    if (type) {
      filter.title = { $regex: type, $options: "i" }; // case-insensitive search
    }
    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
      num: properties.length,
      totalPages,
      currentPage: parseInt(page),
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};  

const getAProperty = async (req, res) => {
  const { propertyId } = req.params;
  try {
    const property = await PROPERTY.findById(propertyId).populate(
      "landlord",
      "fullName profilePicture email phoneNumber"
    );
    //more from landlord
    const moreFromLandlord = await PROPERTY.find({
      landlord: property.landlord._id,
      _id: { $ne: propertyId },
      availability: "available",
    })
      .limit(3)
      .sort("-createdAt");

    //similar price range 20% of the property price and location
    const priceRange = property.price * 0.2;
    const similarProperties = await PROPERTY.find({
      _id: { $ne: propertyId },
      availability: "available",
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange,
      },
      location: property.location,
    })
      .limit(3)
      .sort("-createdAt");
    res.status(200).json({ property, moreFromLandlord, similarProperties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
};

// const PROPERTY = require("../models/property");

// const createProperty = async (req, res) => {
//   res.send("create property");
// };
// const getLandlordsProperty = async (req, res) => {
//   const { userId } = req.user;
//   const { page = 1 } = req.query;
//   const limit = 5;
//   const skip = (page - 1) * limit;
//   try {
//     const properties = await PROPERTY.find({ landlord: userId })
//       .sort("-createdAt")
//       .skip(skip)
//       .limit(limit);
//     const total = await PROPERTY.countDocuments({ landlord: userId });
//     const totalPages = Math.ceil(total / limit);
//     const availableProperties = await PROPERTY.countDocuments({
//       landlord: userId,
//       availability: "available",
//     });
//     const rentedProperties = await PROPERTY.countDocuments({
//       landlord: userId,
//       availability: "rented",
//     });
//     res
//       .status(200)
//       .json({
//         availableProperties,
//         rentedProperties,
//         total,
//         currentPage: parseInt(page),
//         totalPages,
//         properties,
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// const updatePropertyAvailability = async (req, res) => {
//   res.send("update availability");
// };
// const getAllProperty = async (req, res) => {
//   const { page = 1, location, budget, type } = req.query;
//   const limit = 12;
//   const skip = (page - 1) * limit;
//   try {
//     const filter = {
//       availability: "available",
//     };
//     if (location) {
//       filter.location = { $regex: location, $options: "i" };
//     }
//     if (budget) {
//       filter.price = { $lte: parseInt(budget) };
//     }
//     if (type) {
//       filter.title = { $regex: type, $options: "i" };
//     }
//     const properties = await PROPERTY.find(filter)
//       .sort("-createdAt")
//       .skip(skip)
//       .limit(limit);

//     const totalProperties = await PROPERTY.countDocuments(filter);
//     const totalPages = Math.ceil(totalProperties / limit);
//     res
//       .status(200)
//       .json({
//         num: properties.length,
//         totalPages,
//         currentPage: parseInt(page),
//         properties,
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// const getSingleProperty = async (req, res) => {
//   res.send("get a property");
// };

// module.exports = {
//   createProperty,
//   getLandlordsProperty,
//   updatePropertyAvailability,
//   getAllProperty,
//   getSingleProperty,
// };

// const PROPERTY =require("../models/property")

// const createProperty= async (req, res)=>{
//     res.send("create property")
// }
// const getLandlordsProperty=async (req, res)=>{
// const {userId}=req.user
// const { page = 1 } = req.query;
// const limit = 5;
// const skip = (page - 1) * limit;
// try {
//    const properties = await PROPERTY.find({ landlord: userId })
//      .sort("-createdAt")
//      .skip(skip)
//      .limit(limit);

//  const [total, availableProperties, rentedProperties] = await Promise.all([
//     PROPERTY.countDocuments({landlord:userId}),
//    PROPERTY.countDocuments({ landlord: userId, availability: "available" }),
//    PROPERTY.countDocuments({
//     landlord: userId,
//     availability: "rented",
//   });
//  ]);
