"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEmailOnDeleteTemplate = exports.getAdminEmailOnUserDeleteTemplate = exports.getInvitationEmailUserTemplate = exports.getInvitationAdminMailTemplate = exports.getInvitationEmailUserExistTemplate = exports.getRegisterEmailTemplate = exports.getForgotPasswordTemplate = void 0;
// Send email to user for forgot password
const config_1 = __importDefault(require("../../config"));
const getForgotPasswordTemplate = (data) => {
    const { fullName, url } = data;
    return `<!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
				 
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Let's Reset your Password</p>
									<p>Hi <b>${fullName}</b>,</p>
									<p>We have received a request to reset your password.</p>
									<p>If you didn't make this request, please disregard this message. However, if you did the password reset, you can proceed to reset now. 
										<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Reset Your Password<a/></button> </p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
									</div>
						</div> 
					</div>
				</body>
			</html>`;
};
exports.getForgotPasswordTemplate = getForgotPasswordTemplate;
// Send email to user when he subscribe to zoho
const getRegisterEmailTemplate = (data) => {
    const { fullName, url } = data;
    return `
  <!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Browser</title>
				</head>
				<body>

 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:Lexend">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
							<a href="${config_1.default.reactAppBaseUrl}" target="_blank">
							
							<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</a>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Welcome to CostAllocation Pro.</p>
									<p>Hi <b>${fullName}</b>,</p>
                  <p>We hope this email finds you well. On behalf of the entire team at <b>CostAllocation Pro</b>, we wanted to thank you for subscribing to our portal.</p> 
									<p>Please generate password for your account to access our portal using below link : </p>
									<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Generate Password<a/></button> </p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div>
						</div>
					</div>
				</body>
			</html>
  `;
};
exports.getRegisterEmailTemplate = getRegisterEmailTemplate;
// Send email to user on invitation when he is already exist
const getInvitationEmailUserExistTemplate = (data) => {
    const { firstName, lastName, companyName, url } = data;
    return `
    <!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Invitation to join the company.</p>
									<p>Hi <b>${firstName || ''}${lastName ? ` ${lastName}` : ''}</b>,</p>
									<p>You have been invited to join <b>${companyName}</b> on CostAllocation Pro. </p>
									<p>To log in,  
										<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Click Here<a/></button> </p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div>
						</div> 
					</div>
				</body>
			</html>
  `;
};
exports.getInvitationEmailUserExistTemplate = getInvitationEmailUserExistTemplate;
// Send email to admin on user invitation
const getInvitationAdminMailTemplate = (data) => {
    const { invitedByEmail, firstName, lastName, companyName, url } = data;
    return `
    <!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
				 
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Invitation to join the company.</p>
									<p>Hi <b>${invitedByEmail}</b>,</p>
									<p>		You just invited ${firstName || ''} ${lastName || ''} to ${companyName} on CostAllocation Pro.</p><p> If you don't want this person on your account, you can delete them from your Manage Users page.</p>  
										<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Click Here<a/></button>, to view the Manage Users page.</p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div>
						</div> 
					</div>
				</body>
			</html>
  `;
};
exports.getInvitationAdminMailTemplate = getInvitationAdminMailTemplate;
// Send email to user on invitation for the first time
const getInvitationEmailUserTemplate = (data) => {
    const { firstName, lastName, companyName, url } = data;
    return `
 <!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
				 
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Invitation to join the company.</p>
									<p>Hi <b>${firstName || ''}${lastName ? ` ${lastName}` : ''}</b>,</p>
									<p>You have been invited to join <b>${companyName}</b> on CostAllocation Pro.</p>  
									<p>Please generate password for your account to access our portal using below link :</p>  
										<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Generate Password<a/></button></p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div>
						</div> 
					</div>
				</body>
			</html>
  `;
};
exports.getInvitationEmailUserTemplate = getInvitationEmailUserTemplate;
// Send email to admin when user is deleted
const getAdminEmailOnUserDeleteTemplate = (data) => {
    const { adminUserName, firstName, lastName, companyName, url } = data;
    return `	
 		<!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
				 
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Your Access has been Revoked - CostAllocation Pro</p>
									<p>Hi <b>${adminUserName}</b>,</p>
									<p>	User access for ${firstName || ''} ${lastName || ''} has been removed from ${companyName} on CostAllocation Pro.</p>  
									<p>To view the Manage Users page </p>  
										<br/>
									<p style="margin:30px 0px"><button class="reset-button" style="border:none;border-radius:20px;padding:8px 20px;background-color:#000;"><a href='${url}' style="color:white;text-decoration:none;">Click Here<a/></button></p>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div>
						</div> 
					</div>
				</body>
			</html>
	`;
};
exports.getAdminEmailOnUserDeleteTemplate = getAdminEmailOnUserDeleteTemplate;
// Send email to the user who is deleted
const getUserEmailOnDeleteTemplate = (data) => {
    const { firstName, lastName, companyName } = data;
    return `
		<!DOCTYPE html>
			<html lang="en">
				<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap" rel="stylesheet">
						<title>Browser</title> 
				</head>
				<body>
				 
 				 <div style="width:100%; min-height:60vh;display:block; background-color:#f8f1e9; padding : 200px 0px; font-family:'Lexend', sans-serif;">
						<div class="my-card" style="background-color:#fff; border:2px solid #e0e0eb; padding:30px; max-width:470px; border-radius:15px; margin:auto">
							<div class="card-header">
								<img src="https://costallocationspro.s3.amazonaws.com/image/cap-logo.png" width="200"/>
							</div>
							<div class="card-body">
									<p style="font-weight:600; font-size:20px">Your Access has been Revoked - CostAllocation Pro</p>
									<p>Hi <b>${firstName || ''}${lastName ? ` ${lastName}` : ''}</b>,</p>
									<p>	Your user access for ${companyName} on CostAllocation Pro has been removed. </p>  
									<p>Please contact the Administrator on your account if you have any questions.  </p>  
								 	</div>
									<br/>
									<p>	Best Regards,</p>
									<p> CostAllocation Pro Team</p>
								</div> 
							</div> 
					</div>
				</body>
			</html>
	`;
};
exports.getUserEmailOnDeleteTemplate = getUserEmailOnDeleteTemplate;
