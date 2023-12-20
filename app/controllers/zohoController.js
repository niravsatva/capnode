"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../models/customError");
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const crypto = __importStar(require("crypto"));
const util_1 = require("util");
const config_1 = __importDefault(require("../../config"));
const utils_1 = require("../utils/utils");
const zohoService_1 = __importDefault(require("../services/zohoService"));
const samlp = require('samlp');
const readFileAsync = (0, util_1.promisify)(fs.readFile);
class ZohoController {
    SSOLogin(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || '';
                if (!email) {
                    throw new customError_1.CustomError(400, 'Email required');
                }
                // Generate SAML response using the SAML request and user's email
                const samlResponse = yield CommonMethods.GenerateSamlResponse(req.body.sAMLRequest, email);
                console.log('samlResponse: ', samlResponse);
                // Check if the SAML response is null or empty, and return an error response if true
                if (!samlResponse) {
                    return new customError_1.CustomError(400, 'SAML response is invalid.');
                }
                // Return a success response with SSO model containing SAML response, ACS URL, and RelayState
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Success', {
                    SAMLResponse: samlResponse,
                    ACSUrl: config_1.default.SSO_ACSURL,
                    RelayState: req.body.relayState,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    callback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return res.json({
                    result: true
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield zohoService_1.default.refreshToken();
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Success', {
                    result: data
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield zohoService_1.default.generateToken(req.body.url);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Success', {
                    result: data
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createHostedPage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(0, utils_1.hasText)(req.query.companyId)) {
                    throw new customError_1.CustomError(400, 'CompanyId is required');
                }
                const data = yield zohoService_1.default.createHostedPage(req.query.companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Success', {
                    hostedUrl: data
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
class SamlResponseFactoryService {
    static CreateSamlResponse(args, user) {
        const samlResponse = samlp.authnresponse(args, user);
        return samlResponse;
    }
}
class CommonMethods {
    static GenerateSamlResponse(sAMLRequest, email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Decode the SAML request
            const sAMLRequestDecoded = CommonMethods.DecodeSAMLRequest(sAMLRequest);
            console.log('sAMLRequestDecoded: ', sAMLRequestDecoded);
            // Load the decoded SAML request into an XML document
            const sAMLRequestDoc = yield (0, utils_1.parseXml)(sAMLRequestDecoded);
            console.log('sAMLRequestDoc: ', sAMLRequestDoc);
            // Get the root element of the SAML request and extract the "ID" attribute
            const sAMLRequestRoot = sAMLRequestDoc.documentElement;
            console.log('sAMLRequestRoot: ', sAMLRequestRoot);
            const id = sAMLRequestRoot.getAttribute('ID') || '';
            console.log('ID: ', id);
            // Define the path to the signing certificate (PFX file)
            const pfxpath = path.join(__dirname, '..', 'costallocationpro.pfx');
            console.log('pfxpath: ', pfxpath);
            // Check if the PFX file exists, and throw an exception if not
            if (!fs.existsSync(pfxpath)) {
                throw new customError_1.CustomError(400, 'Signing Certificate is missing!');
            }
            // Load the signing certificate from the PFX file using the provided password
            const cert = yield CommonMethods.loadCertificate(pfxpath, config_1.default.SSO_PASSWORD);
            const user = {
                email: email,
            };
            // Create arguments for the SAML response factory
            const samlResponseFactoryArgs = {
                audience: config_1.default.SSO_AUDIENCE,
                isuser: config_1.default.SSO_ISUSER,
                recipient: config_1.default.SSO_ACSURL,
                cert: cert,
                TimeToBeExpired: 30 * 60 * 1000,
                inResponseTo: id,
                profileMapper: (user) => {
                    // Map user data to SAML attributes
                    return {
                        email: user.email,
                    };
                },
            };
            // Create the SAML response using the factory service
            const samlResponse = SamlResponseFactoryService.CreateSamlResponse(samlResponseFactoryArgs, user);
            console.log('samlResponse: ', samlResponse);
            // Convert the SAML response to a Base64-encoded string
            const encodedSamlResponse = Buffer.from(samlResponse).toString('base64');
            console.log('encodedSamlResponse: ', encodedSamlResponse);
            // Return the Base64-encoded SAML response
            return encodedSamlResponse;
        });
    }
    static DecodeSAMLRequest(samlRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert the Base64-encoded SAML request string to a byte array
            const samlBytes = Buffer.from(samlRequest, 'base64');
            // Inflate the DEFLATE-compressed SAML request
            const decodedSaml = zlib.inflateSync(samlBytes).toString('utf-8');
            console.log('decodedSaml: ', decodedSaml);
            // Convert the decoded SAML string to an XML document
            const samlXml = yield (0, utils_1.parseXml)(decodedSaml);
            console.log('samlXml: ', samlXml);
            // Return the outer XML representation of the SAML document
            return samlXml.toString();
        });
    }
    static loadCertificate(pfxpath, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const certBuffer = yield readFileAsync(pfxpath);
            return crypto.createPrivateKey({
                key: certBuffer,
                passphrase: password,
            });
        });
    }
}
exports.default = new ZohoController();
