const uuid = require('uuid');
const { Vehicle_category, Admin } = require('../model/adminModel');
const { Customer, Schedule_vehicle, Customer_Vehilce } = require('../model/customerModel');
const { Service_Providers } = require('../model/washerModel');
const joi = require('joi');
const validationJoi = require('../helper/joiValidation');
const fs = require('file-system');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const { loggingRespons, errorResponse, notFoundResponse, badRequest, successResponse, adminLoggingRespons, successResponseWithData } = require('../middleware/apiResponse');
const { sequelize } = require('../helper/db');

module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().required()
        });
        validationJoi.joiValidation(schema, req.body);
        const email = req.body.email;
        const password = sha1(req.body.password);
        const getAdmin = await Admin.findOne({ where: { email: email } });
        if (getAdmin) {
            if (getAdmin && getAdmin.password == password) {
                const token = jwt.sign(
                    {
                        userId: getAdmin.id,
                        userEmail: getAdmin.email
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.EXPRIE_TIME
                    }
                );
                adminLoggingRespons(
                    res,
                    "OTP is verify",
                    token
                )
            }
            else {
                errorResponse(
                    res,
                    'Password Does not match'
                )
            }
        }
        else {
            notFoundResponse(
                res,
                'User not Found'
            )
        }
    } catch (error) {
        console.log('vehilceCategory Error', error);
        badRequest(res, error);
    }
}

module.exports.vehicleCategory = (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ 'message': 'title is required' });
        }
        else {
            console.log(req.body.title)
        }
        if (!req.body.vehicle_type) {
            res.status(400).json({ 'message': 'vehicle_type is required' });
        }
        if (!req.files.image) {
            res.status(400).json({ 'message': 'image is required' });
        }
        const { title, vehicle_type } = req.body;
        const image = req.files.image;
        // image.forEach(element => {
        //     const imageName = element.name;
        //     const imageExtantion = imageName.split('.').pop();
        //     const imageNewName = uuid.v1()+'.'+ imageExtantion;
        //     console.log('image',imageNewName);
        // });
        const imageName = image.name;
        const imageExtantion = imageName.split('.').pop();
        const images = uuid.v1() + '.' + imageExtantion;
        const data = { title, vehicle_type, images }
        const uploadPath = 'public/upImage/' + images;
        console.log('uploadPath', uploadPath)
        image.mv(uploadPath, async (error) => {
            if (error) {
                console.log('error', error);
            }
            else {
                const addCategory = await Vehicle_category.create(data);
                successResponse(
                    res,
                    'vehicle Cateory Add Successfuly'
                )
            }
        })

    } catch (error) {
        console.log('vehicleCategory Error', error);
        badRequest(res, error);
    }
}

module.exports.getCustomer = async (req, res) => {
    try {
        const customerData = await Customer.findAll({
            attributes: { exclude: ['otp', 'status', 'createDate', 'updateDate'] }
        });
        if (customerData) {
            successResponseWithData(
                res,
                "Customer Data",
                customerData
            );
        }
        else {
            notFoundResponse(res, "Customer Data not Found");
        }
    } catch (error) {
        console.log('getCustomer Error', error);
        badRequest(res, error);
    }
}


module.exports.customerEdit = async (req, res) => {
    try {
        const customerId = req.params.Id;
        const getCustomer = await Customer.findOne({ where: { id: customerId } });
        if (getCustomer) {
            successResponseWithData(
                res,
                "Customer Data",
                getCustomer
            );
        }
        // console.log('getCustomer',getCustomer)
        else {
            notFoundResponse(res, "Customer Data Not Found");
        }
    } catch (error) {
        console.log('getCustomer Error', error);
        badRequest(res, error);
    }
}


module.exports.updateCustomer = async (req, res) => {
    try {
        const schema = joi.object({
            customerId: joi.number().required(),
            fullName: joi.string().required(),
            email: joi.string().email().required(),
            phoneNum: joi.string().required(),
            address: joi.string().required(),
            wing: joi.string().required(),
            society: joi.string().required(),
            state: joi.string().required(),
            city: joi.string().required(),
            pincode: joi.string().required(),
        });
        validationJoi.joiValidation(schema, req.body);
        const { customerId, fullName, email, phoneNum, address, wing, society, state, city, pincode } = req.body;
        const data = { customerId, fullName, email, phoneNum, address, wing, society, state, city, pincode };
        const update = await Customer.update(data, { where: { id: customerId } });
        if (update) {
            successResponse(
                res,
                'Customer Updated Successfuly'
            )
        }
    } catch (error) {
        console.log('updateCustomer Error', error);
        badRequest(res, error);
    }
}


module.exports.addCustomer = async (req, res) => {
    try {
        const schema = joi.object({
            fullName: joi.string().min(2).required(),
            email: joi.string().min(2).required(),
            phoneNum: joi.string().min(2).required(),
            address: joi.string().min(2).required(),
            wing: joi.string().min(2).required(),
            society: joi.string().min(2).required(),
            state: joi.string().min(2).required(),
            city: joi.string().min(2).required(),
            pincode: joi.string().min(2).required(),
        });
        validationJoi.joiValidation(schema, req.body);
        const status = true
        const { fullName, email, phoneNum, address, wing, society, state, city, pincode } = req.body;
        const data = { fullName, email, phoneNum, address, wing, society, state, city, pincode, status };
        const addCustomer = await Customer.create(data);
        if (addCustomer) {
            successResponse(
                res,
                'Residents Add Successfuly'
            )
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('addCustomer Error', error);
        badRequest(res, error);
    }
}


module.exports.deleteResidents = async (req, res) => {
    try {
        const residentId = req.params.id;
        if (residentId) {
            const destroyData = await Customer.destroy({ where: { id: residentId } });
            if (destroyData) {
                successResponse(res, "One Resident Delete Successfully");
            }
            else {
                notFoundResponse(res, "Resident not Found");
            }
        }
        else {
            res.json({ 'message': 'id is required' });
        }
    } catch (error) {
        console.log('deleteResidents Error', error);
        badRequest(res, error);
    }
}


module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            const adminData = await Admin.findOne({
                attributes: { exclude: ['password'] },
                where: {
                    id: userId
                }
            });
            if (adminData) {
                successResponseWithData(
                    res,
                    "Your Profile",
                    adminData
                )
            }
            else {
                notFoundResponse(res, "Profile not Found");
            }
        }
        else {
            res.json({ 'message': 'id is required' });
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}


module.exports.service_Providers_list = async (req, res) => {
    try {
        const list_washers = await Service_Providers.findAll({
            attributes: [
                'id', 'fullName', 'email', 'phoneNum', 'address', 'state', 'country', 'city', 'createDate',
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'washer_profile/' + "',image)"), 'image']
            ]
        });
        if (list_washers) {
            successResponseWithData(
                res,
                "Service provider list",
                list_washers
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not Found"
            )
        }
    } catch (error) {
        console.log('service_Providers_list Error', error);
        badRequest(res, error);
    }
}


module.exports.service_Providers_ById = async (req, res) => {
    try {
        const washerId = req.params.id;
        if (washerId) {
            const getDataById = await Service_Providers.findOne({
                attributes: [
                    'id', 'fullName', 'email', 'phoneNum', 'address', 'state', 'country', 'city', 'createDate',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'washer_profile/' + "',image)"), 'image']
                ],
                where: {
                    id: washerId
                }
            });
            if (getDataById) {
                successResponseWithData(res, "Data Get Successfully", getDataById)
            }
            else {
                notFoundResponse(res, "Data not Found");
            }
        }
    } catch (error) {
        console.log('service_Providers_ById Error', error);
        badRequest(res, error);
    }
}


module.exports.update_service_providers = (req, res) => {
    try {
        const schema = joi.object({
            id: joi.number().required(),
            fullName: joi.string().min(3).required(),
            email: joi.string().email().min(3).required(),
            phoneNum: joi.string().min(10).required(),
            address: joi.string().min(3).required(),
            state: joi.string().min(1).required(),
            country: joi.string().min(3).required(),
            city: joi.string().min(3).required(),
        });
        const { fullName, email, phoneNum, address, state, country, city, id } = req.body;
        const data = { fullName, email, phoneNum, address, state, country, city, id }
        validationJoi.joiValidation(schema, data);
        const userId = req.userId;
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/washer_profile/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    data.image = imageNewName
                    const addWasher = await Service_Providers.update(data, { where: { id: id } });
                    if (addWasher) {
                        successResponse(
                            res,
                            'Profile Update Successfuly',
                        )
                    }
                }
            });
        }
        else {
            res.status(404).json({ 'message': "image is required" });
        }
    } catch (error) {
        console.log('update_service_providers Error', error);
        badRequest(res, error);
    }
}


module.exports.delete_service_providers = async (req, res) => {
    try {
        const washerId = req.params.id;
        if (washerId) {
            const finddata = await Service_Providers.findOne({ where: { id: washerId } });
            if (finddata) {
                const destroyData = await Service_Providers.destroy({ where: { id: washerId } });
                if (destroyData) {
                console.log('finddata', finddata)

                const image = destroyData.music;
                fs.unlink('public/washer_profile/' + image, function (error) {
                    if (error) {
                        console.log(error);
                    }
                });
                successResponse(res, "One service provide delete successfully");
                }
            }
            else {
                notFoundResponse(res, "Not Found");
            }
        }
        else {
            res.json({ 'message': 'id is required' });
        }
    } catch (error) {
        console.log('delete_service_providers Error', error);
        badRequest(res, error);
    }
}

// module.exports.vehicles = async(req,res) => {
//     try {
//         const vehicleData = await Customer_Vehilce.findAll({
//             attributes : [
//                 'id','vehicle_type','vehicle_title','vehicle_model','vehicle_color','license_num','parking_num','createDate',
//                 // [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'vehilceImage/' + "',image')"), 'image')],
//                 [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'vehilceImage/' + "',image)"), 'image'] 
//             ]
//         });
//         if(vehicleData){
//             successResponseWithData(
//                 res,
//                 "Customer Data",
//                 vehicleData
//             );
//         }
//         else{
//             notFoundResponse(res,"Vehicle Data not Found");
//         }
//     } catch (error) {
//         console.log('vehicles Error', error);
//         badRequest(res,error);
//     }
// }


module.exports.schedule_list = async(req,res) => {
    try {
        const scheduleListData = await Schedule_vehicle.findAll(
            {include: [Customer_Vehilce]}
        );
        if(scheduleListData){
            successResponseWithData(
                res,
                "Vehicle schedule List",
                scheduleListData
            );
        }
        else{
            notFoundResponse(res,"Data Not Found");
        }
    } catch (error) {
        console.log('schedule_list Error', error);
        badRequest(res, error);
    }
}