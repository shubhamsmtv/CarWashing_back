const joi = require('joi');
const validateSchema = require('../helper/joiValidation');
const { Customer, State, Cities, Pincode, Customer_Vehilce, Wallet, Schedule_vehicle } = require('../model/customerModel');
const { Vehicle_category } = require('../model/adminModel');
const { Washer_service } = require('../model/washerModel');
const otoGenerator = require('otp-generator')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../helper/db');
const uuid = require('uuid');
const { successResponseWithData, errorResponse, successResponse, notFoundResponse, badRequest, loggingRespons, successCompleteRes, velideUser } = require('../middleware/apiResponse');

// module.exports.register = async (req, res) => {
//     try {
//         const schema = joi.object({
//             phone_Num: joi.string().min(10).required(),
//         });
//         validateSchema.joiValidation(schema, req.body);
//         const phoneNum = req.body.phone_Num;
//         const getMobile = await Customer.findOne({ where: { phoneNum: phoneNum } });
//         if (getMobile) {
//             // if (getMobile && getMobile.status == 1) {
//             //     errorResponse(
//             //         res,
//             //         'This Number is Already Registered'
//             //     )
//             // }
//             // else {
//                 const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
//                 const data = { phoneNum, otp }
//                 const sendOTP = async (phoneNum, otp) => {
//                     const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
//                     if (res.status == 200 && res.data.status == "success") {
//                         const response = await Customer.update({ otp: otp }, { where: { phoneNum: phoneNum } });
//                         return response
//                     }
//                 }
//                 const result = await sendOTP(phoneNum, otp);
//             console.log(otp);

//                 if (result) {
//                     successResponseWithData(res, "Otp Send Successfully",otp)
//                 }
//             // }
//         }
//         else {
//             const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
//             const data = { phoneNum, otp }
//             console.log(otp);
//             const sendOTP = async (phoneNum, otp) => {
//                 const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
//                 if (res.status == 200 && res.data.status == "success") {
//                     const response = await Customer.create(data);
//                     return response
//                 }
//             }
//             const result = await sendOTP(phoneNum, otp);
//             if (result) {
//                 successResponse(res, "Otp Send Successfully")
//             }
//         }
//     } catch (error) {
//         console.log('register Error', error);
//         badRequest(res, error);
//     }
// }

module.exports.otpVerify = async (req, res) => {
    try {
        const schema = joi.object({
            phoneNum: joi.string().min(10).required(),
            otp: joi.number().min(4).required(),
            fcm_token: joi.string().required(),
            device_type: joi.number().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const { fcm_token, device_type } = req.body;
        const otp = req.body.otp;
        const phoneNum = req.body.phoneNum;
        const data = { fcm_token, device_type }
        const getUser = await Customer.findOne({
            attributes: { exclude: ['createDate', 'updateDate'] },
            where: { phoneNum: phoneNum }
        });
        if (getUser) {
            console.log(getUser.otp == otp)
            if (getUser.otp == otp) {
                await Customer.update(data, { where: { id: getUser.id } })
                const token = jwt.sign(
                    {
                        userId: getUser.id,
                        phoneNum: getUser.phoneNum,
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.EXPRIE_TIME
                    }
                )
                if (getUser && getUser.status == 1) {
                    loggingRespons(
                        res,
                        "OTP is verify",
                        true,
                        token,
                        getUser
                    )
                }
                else {
                    loggingRespons(
                        res,
                        "OTP is verify",
                        false,
                        token,
                        getUser
                    )
                }
            }
            else {
                notFoundResponse(res, "Invalid otp");
            }
        }
        else {
            errorResponse(
                res,
                "Mobile number not exist"
            )
        }
    } catch (error) {
        console.log('otpVerify Error', error);
        badRequest(res, error);
    }
}

// module.exports.login = async (req, res) => {
//     try {
//         const schema = joi.object({
//             phone_Num: joi.string().required(),
//         });
//         validateSchema.joiValidation(schema, req.body);
//         const phoneNum = req.body.phone_Num;
//         const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
//         const getUser = await Customer.findOne({ where: { phoneNum: phoneNum } });
//         if (getUser) {
//             const sendOTP = async (phoneNum, otp) => {
//                 const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=91${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
//                 if (res.status == 200 && res.data.status == "success") {
//                     const response = await Customer.update({ otp: otp }, { where: { id: getUser.id } });
//                     return response
//                 }
//             }
//             const result = await sendOTP(phoneNum, otp);
//             if (result) {
//                 successResponse(
//                     res,
//                     "Otp Send Successfully"
//                 )
//             }
//         }
//         else {
//             errorResponse(
//                 res,
//                 "User Not Found"
//             )
//         }
//     } catch (error) {
//         console.log('login Error', error);
//         badRequest(res, error);
//     }
// }

module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            phone_Num: joi.string().min(10).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const phoneNum = req.body.phone_Num;
        const getMobile = await Customer.findOne({ where: { phoneNum: phoneNum } });
        if (getMobile) {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phoneNum, otp }
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.update({ otp: otp }, { where: { phoneNum: phoneNum } });
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
            console.log(otp);

            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
        else {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phoneNum, otp }
            console.log(otp);
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.create(data);
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
    } catch (error) {
        console.log('register Error', error);
        badRequest(res, error);
    }
}

module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const getData = await Customer.findOne(
            {
                attributes: [
                    'id', 'fullName', 'email', 'phoneNum', 'address', 'wing', 'society', 'state', 'city', 'pincode',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'customerImg/' + "',profile_img)"), 'profile_img']
                ],
                where: { id: userId }
            });

        if (getData) {
            successResponseWithData(
                res,
                'User Profile Get Successfuly',
                getData
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not found"
            )
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}


module.exports.uploadProfile = (req, res) => {
    try {
        const userId = req.userId;
        if (req.files && req.files.profile) {
            const image = req.files.profile;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/customerImg/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    const addProfile = await Customer.update({ profile_img: imageNewName }, { where: { id: userId } });;
                    if (addProfile) {
                        successResponse(
                            res,
                            'Profile Added Successfuly',
                        )
                    }
                }
            });
        }
        else {
            res.json({ 'message': 'profile is required' });
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}

module.exports.complitProfile = async (req, res) => {
    try {
        const schema = joi.object({
            fullName: joi.string().min(3).required(),
            email: joi.string().min(3).required(),
            phoneNum: joi.string().min(10).required(),
            address: joi.string().min(3).required(),
            wing: joi.string().min(3).required(),
            society: joi.string().min(3).required(),
            state: joi.string().min(1).required(),
            city: joi.string().min(3).required(),
            pincode: joi.number().min(3).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const userId = req.userId;
        const updateDate = new Date();
        const status = true
        const { fullName, email, phoneNum, address, wing, society, state, city, pincode } = req.body;
        const data = { fullName, email, phoneNum, address, wing, society, state, city, pincode, updateDate, status };
        if (userId) {
            const updateData = await Customer.update(data, { where: { id: userId } });
            if (updateData) {
                const vehicle_data = await Customer_Vehilce.findOne({ where: { userId: userId } });
                if (!vehicle_data) {
                    successCompleteRes(
                        res,
                        "Your Profile Is Completed Successfully",
                        vehicle_data,
                        false
                    )
                }
                else {
                    successCompleteRes(
                        res,
                        "Your Profile Is Completed Successfully",
                        vehicle_data,
                        true
                    )
                }
            }
        }
        else {
            errorResponse(
                res,
                "Invaled Token"
            )
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}

module.exports.getVehilceCategory = async (req, res) => {
    try {
        const vehicleType = req.query.type;
        const getCategory = await Vehicle_category.findAll({
            attributes: [
                'id', 'title', 'vehicle_type',
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'upImage/' + "',images)"), 'images']
            ],
            where: { vehicle_type: vehicleType }
        });

        if (getCategory) {
            successResponseWithData(
                res,
                "Get vehilce",
                getCategory
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not Found"
            )
        }
    } catch (error) {
        console.log('getVehilceType Error', error);
        badRequest(res, error);
    }
}

module.exports.getVehicleType = async (req, res) => {
    try {
        const cate = await Vehicle_category.findAll({
            attributes: [

                sequelize.literal('distinct `vehicle_type`'), 'vehicle_type'
            ],
        })

        if (cate) {
            res.status(200).json({
                status: true,
                category: cate
            });
        } else {
            res.status(200).json({
                status: false,
                message: "vehicle category is not available."
            });
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json({
            status: false,
            error: error
        })
    }
}

module.exports.getState = async (req, res) => {
    try {
        const stateData = await State.findAll();
        if (stateData) {
            successResponseWithData(
                res,
                "State's Get Successfully",
                stateData
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not Found"
            )
        }
    } catch (error) {
        console.log('getState Error', error);
        badRequest(res, error);
    }
}

module.exports.getCity = async (req, res) => {
    try {
        const stateID = req.params.stateID;
        const cityData = await Cities.findAll({ where: { state_id: stateID } });
        if (cityData) {
            successResponseWithData(
                res,
                "Cites Get Successfully",
                cityData
            )
        }
        else {
            notFoundResponse(
                res,
                "City Not Found"
            )
        }
    } catch (error) {
        console.log('getCity Error', error);
        badRequest(res, error);
    }
}

module.exports.getPincode = async (req, res) => {
    try {
        const state_id = req.body.stateID;
        const cities = req.body.cityName;
        if (state_id && cities) {
            const GetPincode = await Pincode.findAll({ where: { city: cities, state_id: state_id } });
            if (GetPincode.length) {
                successResponseWithData(
                    res,
                    "Cites Get Successfully",
                    GetPincode
                )
            }
            else {
                notFoundResponse(
                    res,
                    "City Not Found"
                )
            }
        }
        else {
            res.status(400).json({ 'message': 'State Id and City is required' });
        }
    } catch (error) {
        console.log('getPincode Error', error);
        badRequest(res, error);
    }
}

module.exports.addVehicle = async (req, res) => {
    try {
        const schema = joi.object({
            vehicle_type: joi.string().required(),
            vehicle_title: joi.string().required(),
            vehicle_model: joi.string().required(),
            vehicle_color: joi.string().required(),
            license_num: joi.string().required(),
            parking_num: joi.string().required(),
            image: joi.string().required()
        });
        validateSchema.joiValidation(schema, req.body);
        const userId = req.userId;
        const getVehicle = await Customer_Vehilce.findAndCountAll({ where: { userId: userId } });
        console.log('getVehicle', getVehicle)
        if (getVehicle.count < 4) {
            const status = true
            const { vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image } = req.body;
            const data = { userId, vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image }
            // if (req.files) {
            //     const image = req.files.image;
            //     const imageName = image.name;
            //     const imageExtantion = imageName.split('.').pop();
            //     const imageNewName = uuid.v1() + '.' + imageExtantion;;
            //     const uploadPath = 'public/vehilceImage/' + imageNewName;
            //     image.mv(uploadPath, async (error, result) => {
            //         if (error) {
            //             console.log('error', error);
            //         }
            //         else {
            //             data.image = imageNewName
            //             const addVehilce = await Customer_Vehilce.create(data);
            //             if (addVehilce) {
            //                 successResponse(
            //                     res,
            //                     'Vehilce Data Added Successfuly',
            //                 )
            //             }
            //         }
            //     });
            // }
            // else {
            const addVehilce = await Customer_Vehilce.create(data);
            if (addVehilce) {
                await Customer.update({ vehicle_status: true }, { where: { id: userId } })
                successResponse(
                    res,
                    'Vehilce Data Added Successfuly',
                )
            }
            else {
                errorResponse(res, "Something Went Wrong")
            }
        }
        else {
            errorResponse(res,"You have add only four vehicle");
        }
        return false

        // }
    } catch (error) {
        console.log('addVehilcle Error', error);
        badRequest(res, error);
    }
}


module.exports.vehicleList = async (req, res) => {
    try {
        const userId = req.userId;
        const vehicle_list = await Customer_Vehilce.findAll({ where: { userId: userId } });
        if (vehicle_list) {
            successResponseWithData(
                res,
                "Vehicle List",
                vehicle_list
            )
        }
        else {
            notFoundResponse(
                res,
                "Vehicle not found"
            )
        }
    } catch (error) {
        console.log('vehicleList Error', error);
        badRequest(res, error);
    }
}


module.exports.getVehicleById = async (req, res) => {
    try {
        const userId = req.userId;
        const vehicleId = req.params.vehicleId;
        if (vehicleId) {
            const vehicle = await Customer_Vehilce.findOne({ where: { id: vehicleId, userId: userId } });
            if (vehicle) {
                successResponseWithData(
                    res,
                    "Vehicle Finded",
                    vehicle
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Vehicle not found"
                )
            }
        }
        else {
            errorResponse(res, "vehicle id is required");
        }
    } catch (error) {
        console.log('getVehicleById Error', error);
        badRequest(res, error);
    }
}


module.exports.updateVehicle = async (req, res) => {
    try {
        const schema = joi.object({
            vehicleId: joi.number().required(),
            vehicle_type: joi.string().required(),
            vehicle_title: joi.string().required(),
            vehicle_model: joi.string().required(),
            vehicle_color: joi.string().required(),
            license_num: joi.string().required(),
            parking_num: joi.string().required(),
            image: joi.string().required()
        });
        validateSchema.joiValidation(schema, req.body)
        const userId = req.userId;
        const { vehicleId, vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image } = req.body
        const data = { vehicleId, vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image }
        const upVehicle = await Customer_Vehilce.update(data, { where: { id: vehicleId, userId: userId } });
        if (upVehicle) {
            successResponse(
                res,
                "Vehicle Updated Successfully"
            )
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('updateVehicle Error', error);
        badRequest(res, error);
    }
}


module.exports.deleteVehicle = async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        if (vehicleId) {
            const destroy = await Customer_Vehilce.destroy({ where: { id: vehicleId } });
            if (destroy) {
                successResponse(res, "Vehicle Deleted Successfully");
            }
            else {
                errorResponse(
                    res,
                    "Something Went Wrong"
                )
            }
        }
        else {
            errorResponse(res, "vehicle id is required");
        }
    } catch (error) {
        console.log('deleteVehicle Error', error);
        badRequest(res, error);
    }
}

module.exports.addWallet = async (req, res) => {
    try {
        const schema = joi.object({
            amount: joi.number().required(),
            coupon_code: joi.string().required(),
            payment_method: joi.string().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const userId = req.userId;
        const { amount, coupon_code, payment_method } = req.body;
        const paymentData = { userId, amount, coupon_code, payment_method }
        const addpayment = await Wallet.create(paymentData);
        if (addpayment) {
            successResponseWithData(
                res,
                "Money will be added in wallet"
            )
        }
        else {
            errorResponse(
                res,
                "Something Went Wrong",
            )
        }
    } catch (error) {
        console.log('addWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.getWallet = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            const walletData = await Wallet.findAll({
                where: {
                    userId: userId
                },
                order: [['createDate', 'DESC']],
            });
            if (walletData) {
                successResponseWithData(
                    res,
                    "Transaction History",
                    walletData
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
        else {
            errorResponse(
                res,
                "Something Went Wrong"
            )
        }
    } catch (error) {
        console.log('getWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.walletBalance = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            const totleBal = await Wallet.sum('amount', { where: { userId: userId } });
            if (totleBal) {
                successResponseWithData(
                    res,
                    "Totle Amount",
                    totleBal
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
    } catch (error) {
        console.log('getWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.my_services = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            const myService = await Washer_service.findAll({
                attributes: [
                    'id', 'userId', 'date', 'time',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'serviceImg/' + "',image)"), 'image']
                ],
                where: {
                    userId: userId
                }
            });
            if (myService) {
                successResponseWithData(
                    res,
                    "My Services",
                    myService
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('my_services Error', error);
        badRequest(res, error);
    }
}




module.exports.setschedule = async (req, res) => {
    try {
        const schema = joi.object({
            schedule_date: joi.date().required(),
            address: joi.string().required(),
            vehicle_id: joi.string().required()
        });
        validateSchema.joiValidation(schema, req.body);
        const userId = req.userId;
        const { schedule_date, address, vehicle_id } = req.body;
        const data = { userId, schedule_date, address, vehicle_id };
        const createData = await Schedule_vehicle.create(data);
        if (createData) {
            successResponse(res, "Vehicle Schedule Added Successfully");
        }
        else {
            errorResponse(res, "Something Went Wrong")
        }
    } catch (error) {
        console.log('setschedule Error', error);
        badRequest(res, error);
    }
}