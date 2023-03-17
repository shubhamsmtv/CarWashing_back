const uuid = require('uuid');
const { Vehicle_category, Admin, Washer_task, Setting } = require('../model/adminModel');
const { Customer, Schedule_vehicle, Customer_Vehilce } = require('../model/customerModel');
const { Service_Providers } = require('../model/washerModel');
const joi = require('joi');
const validationJoi = require('../helper/joiValidation');
const fs = require('file-system');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const { loggingRespons, errorResponse, notFoundResponse, badRequest, successResponse, adminLoggingRespons, successResponseWithData } = require('../middleware/apiResponse');
const { sequelize } = require('../helper/db');
const send_mailer = require('../helper/nodemailer');

module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            email: joi.string().email().required().messages({"string.empty": "email is required"}),
            password: joi.string().required().messages({"string.empty": "password is required"})
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
        const uploadPath = 'public/vehilceImage/' + images;
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
        const pageSize = req.query.pageSize;
        const pageNumber = req.query.pageNumber
        if (pageNumber && pageSize) {
            limit = parseInt(pageSize);
            offset = limit * (pageNumber - 1);
        } else {
            limit = parseInt(10);
            offset = limit * (1 - 1);
        }
        const customerData = await Customer.findAll({
            attributes: { exclude: ['otp', 'status', 'created_at', 'updated_at'] },
            limit,
            offset,
            order: [['created_at', 'DESC']]
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
        const data = {};
        if (req.body.fullName) {
            data.fullName = req.body.fullName;
        }
        if (req.body.email) {
            data.email = req.body.email;
        }
        if (req.body.phone_num) {
            data.phone_num = req.body.phone_num;
        }
        if (req.body.address) {
            data.address = req.body.address;
        }
        if (req.body.wing) {
            data.wing = req.body.wing;
        }
        if (req.body.society) {
            data.society = req.body.society;
        }
        if (req.body.state) {
            data.state = req.body.state;
        }
        if (req.body.city) {
            data.city = req.body.city;
        }
        if (req.body.pincode) {
            data.pincode = req.body.pincode;
        }
        const customerId = req.body.customerId;
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
            fullName: joi.string().min(2).required().messages({"string.empty": "fullName is required"}),
            email: joi.string().min(2).required().messages({"string.empty": "email is required"}),
            phone_num: joi.string().min(2).required().messages({"string.empty": "phone_num is required"}),
            address: joi.string().min(2).required().messages({"string.empty": "address is required"}),
            wing: joi.string().min(2).required().messages({"string.empty": "wing is required"}),
            society: joi.string().min(2).required().messages({"string.empty": "society is required"}),
            state: joi.string().min(2).required().messages({"string.empty": "state is required"}),
            city: joi.string().min(2).required().messages({"string.empty": "city is required"}),
            pincode: joi.string().min(2).required().messages({"string.empty": "pincode is required"}),
        });
        validationJoi.joiValidation(schema, req.body);
        const status = true
        const { fullName, email, phone_num, address, wing, society, state, city, pincode } = req.body;
        const data = { fullName, email, phone_num, address, wing, society, state, city, pincode, status };
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
        const pageSize = req.query.pageSize;
        const pageNumber = req.query.pageNumber
        if (pageNumber && pageSize) {
            limit = parseInt(pageSize);
            offset = limit * (pageNumber - 1);
        } else {
            limit = parseInt(10);
            offset = limit * (1 - 1);
        }
        const list_washers = await Service_Providers.findAll({
            attributes: [
                'id', 'full_name', 'email', 'phone_num', 'address', 'state', 'country', 'city', 'created_at',
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'washer_profile/' + "',image)"), 'image']
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        if (list_washers) {
            console.log('list_washers', list_washers)
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
                    'id', 'full_name', 'email', 'phone_num', 'address', 'state', 'country', 'city', 'created_at',
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


module.exports.update_service_providers = async (req, res) => {
    try {
        const data = {} = req.body;
        if (req.body.full_name) {
            data.full_name = req.body.full_name;
        }
        if (req.body.email) {
            data.email = req.body.email;
        }
        if (req.body.phone_num) {
            data.phone_num = req.body.phone_num;
        }
        if (req.body.address) {
            data.address = req.body.address;
        }
        if (req.body.state) {
            data.state = req.body.state;
        }
        if (req.body.country) {
            data.country = req.body.country;
        }
        if (req.body.city) {
            data.city = req.body.city;
        }
        const id = req.body.id;
        // const userId = req.userId;
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
                    console.log('dattt@@@@@@@@@@@@@@@', data);
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
            console.log('daattataa', data);
            const addWasher = await Service_Providers.update(data, { where: { id: id } });
            if (addWasher) {
                successResponse(
                    res,
                    'Profile Update Successfuly',
                )
            }
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


module.exports.schedule_list = async (req, res) => {
    try {
        const pageSize = req.query.pageSize;
        const pageNumber = req.query.pageNumber
        if (pageNumber && pageSize) {
            limit = parseInt(pageSize);
            offset = limit * (pageNumber - 1);
        } else {
            limit = parseInt(10);
            offset = limit * (1 - 1);
        }
        const scheduleListData = await Schedule_vehicle.findAll({
            limit,
            offset,
            order: [['created_at', 'DESC']]
        }
            // {include: [Customer_Vehilce]}
        );
        if (scheduleListData) {
            successResponseWithData(
                res,
                "Vehicle schedule List",
                scheduleListData
            );
        }
        else {
            notFoundResponse(res, "Data Not Found");
        }
    } catch (error) {
        console.log('schedule_list Error', error);
        badRequest(res, error);
    }
}


module.exports.assignTask = async (req, res) => {
    try {
        const schema = joi.object({
            schedul_id: joi.number().required().messages({"string.empty": "schedul_id is required"}),
            washer_id: joi.number().required().messages({"string.empty": "washer_id is required"}),
        });
        validationJoi.joiValidation(schema, req.body);
        const { schedul_id, washer_id } = req.body;
        const data = { schedul_id, washer_id };
        const addtask = await Washer_task.create(data);
        if (addtask) {
            await Schedule_vehicle.update({ status: 'confirmed' }, { where: { schedul_id: schedul_id } });
            successResponse(res, "Task Assign Successfuly");
        }
        else {
            errorResponse(res, "Somthing went wrong")
        }
    } catch (error) {
        console.log('assignTask Error', error);
        badRequest(res, error);
    }
}

module.exports.dashboard = async (req, res) => {
    try {
        const totleCustomer = await Customer.count('fullName');
        console.log('totleCustomer', totleCustomer)
        const totleWasher = await Service_Providers.count('full_name');
        const array = [{
            totleCustomer,
            totleWasher
        }]
        if (totleCustomer && totleWasher) {
            successResponseWithData(res, "Totle Data", array);
        }
    } catch (error) {
        console.log('dashboard Error', error);
        badRequest(res, error);
    }
}


module.exports.add_service_providers = (req, res) => {
    try {
        const schema = joi.object({
            full_name: joi.string().min(3).required().messages({"string.empty": "full_name is required"}),
            email: joi.string().email().min(3).required().messages({"string.empty": "email is required"}),
            phone_num: joi.number().min(10).required().messages({"string.empty": "phone_num is required"}),
            address: joi.string().min(3).required().messages({"string.empty": "address is required"}),
            state: joi.string().min(1).required().messages({"string.empty": "state is required"}),
            country: joi.string().min(3).required().messages({"string.empty": "country is required"}),
            city: joi.string().min(3).required().messages({"string.empty": "city is required"}),
        });
        const { full_name, email, phone_num, address, state, country, city } = req.body;
        const data = { full_name, email, phone_num, address, state, country, city }
        validationJoi.joiValidation(schema, data);
        data.Pro_status = true
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
                    const addWasher = await Service_Providers.create(data);
                    if (addWasher) {
                        const subject = 'Login Credentials';
                        const text = "Hello" + ' ' + full_name + ' ' +
                            'Your credentials is ' + phone_num + '.'
                        await send_mailer.sendMail(email, subject, text);
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
        console.log('add_service_providers Error', error);
        badRequest(res, error);
    }
}




module.exports.registrations_control = async (req, res) => {
    try {
        const user_id = req.userId;
        const status = req.body.status;
        console.log('status', status)
        if (status) {
            const statusdata = await Setting.update({ value: status }, { where: { id: 1 } });
            if (statusdata) {
                successResponse(
                    res,
                    'Status'
                )
            }
            else {
                errorResponse(res, "Somthing Went Wrong")
            }
        }
        else {
            errorResponse(res, "status is required")
        }
    } catch (error) {
        console.log('status Error', error);
        badRequest(res, error);
    }
}





