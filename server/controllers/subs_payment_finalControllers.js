const subscriptionPaymentFinal = require("../models/subscription_payment_final");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const MAX_FILE_SIZE = 750 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/PaymentReceipt/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

const uploadPDF = upload.single('path_sub_pdf');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

exports.submitSubsPaymentFinal = async (req, res) => {
  try {
    uploadPDF(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size is too large. Maximum allowed size is 750 KB.", success: false });
        }
        return res.status(500).json({ message: "Error in file upload", success: false, error: err.message });
      }

      const {
        name, state_id, address, email, mobile, region_name, subs_recieptNo, subs_recieptAmt,
        GST_name, GST_number, user_reg_id, cors_plan, subscription_charges, GST_amt
      } = req.body;

    

      const dateCreatedInKolkata = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = String(date.getFullYear()).slice(-2);
      const datePrefix = `${region_name === "region-1" ? 'R1' : 'R2'}-${day}${month}${year}-`;

      const lastAppNum = await subscriptionPaymentFinal.findAll({
        order: [['ack_no', 'DESC']],
        limit: 1,
      });

      let ack_no;
      if (lastAppNum.length > 0 && lastAppNum[0].ack_no.startsWith(datePrefix)) {
        const lastNumber = parseInt(lastAppNum[0].ack_no.replace(datePrefix, ''), 10);
        ack_no = `${datePrefix}${(lastNumber + 1).toString().padStart(3, '0')}`;
      } else {
        ack_no = `${datePrefix}001`;
      }

      const formData = {
        ack_no,
        subs_recieptNo,
        subs_recieptAmt,
        gst_recieptAmt: GST_amt,
        name,
        email,
        user_reg_id,
        cors_plan,
        subscription_charges,
        mobile,
        address,
        state_id,
        date_created: dateCreatedInKolkata,
        GST_name: GST_name || null,
        GST_number: GST_number || null,
        path_sub_pdf: req.file ? req.file.path : null,
      };

      const createdFormData = await subscriptionPaymentFinal.create(formData);

      const mailOptions = {
        from: 'cors.surveyofindia@gmail.com',
        to: email,
        subject: 'CORS Subscription',
        text: `Dear ${name},\n\nYour order for the purchase of CORS Products and Services has been placed successfully. Your order Acknowledgement Number is ${formData.ack_no}. Please keep this number for future correspondence. On successful verification of payment details, your subscription will be activated within 24 hours.\n\nTeam CORS\nGeodetic And Research Branch\nSURVEY OF INDIA\nThis is a system-generated email, please do not reply to this email.`
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({
        message: 'Form data submitted successfully!',
        data: createdFormData,
        success: true,
      });
    });
  } catch (error) {
    console.error('Error in details submission:', error);
    res.status(500).json({ message: "Error in details submission!", success: false, error: error.message });
  }
};

exports.getSubsPaymentFinal = async (req, res) => {
  try {
    let getData = await subscriptionPaymentFinal.findAll();

    if (getData.length === 0) {
      return res
        .status(200)
        .send({ message: "Data not found!", success: true });
    }

    res
      .status(200)
      .send({ message: "Data fetched successfully!", success: true, data: getData });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error in details fetching!", success: false, error });
  }
};

exports.updateSubsPaymentFinal = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).send({
      message: "Error in final payment details updation",
      success: false,
      error,
    });
  }
};
























