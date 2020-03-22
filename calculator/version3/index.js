const Alexa = require('ask-sdk-core');

const promisify = require('es6-promisify');

const appId = 'amzn1.ask.skill.5bc8f4fa-b6ca-4052-a923-eb5fa6ce9a32';

const opTable = 'Statistics';

const docClient = new Alexa.DynamoDB.DocumentClient();

const dbScan = promisify(docClient.scan, docClient);
const dbGet = promisify(docClient.get, docClient);
const dbPut = promisify(docClient.put, docClient);
const dbDelete = promisify(docClient.delete, docClient);




const LaunchRequestHandler = {
	canHandle(handlerInput){
		return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
	},
	handle(handlerInput){
		return handlerInput.responseBuilder
		.speak(welcomeMessage)
		.reprompt(helpMessage)
		.getResponse();
	},
};


const StatsHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside StatsHandler");
		console.log(JSON.stringify(request));


        return request.type === 'IntentRequest' && request.intent.name === 'ShowStats' ; 

	},
	async handle(handlerInput){
	    
	    const attributesManager = handlerInput.attributesManager;
	    const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
	    
	    const op = sessionAttributes.hasOwnProperty('operation') ? sessionAttributes.operation : 0;
        const time = sessionAttributes.hasOwnProperty('timestamp') ? sessionAttributes.timestamp : 0;
        
        const speakOutput = `You have the following stats : operation ${op} times; timestamped ${time}.`;
        const response = handlerInput.responseBuilder;
        
        return response
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse()
	},
};


const MathHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;

		console.log("Inside MathHandler - canHandle");
		console.log(JSON.stringify(request));

        return request.type === 'IntentRequest' &&
				request.intent.name === 'DoMath'; 
	},
	async handle(handlerInput){
		console.log("Inside MathHandler - handle");
        
        const { userId } = this.event.session.user;
        const slot = handlerInput.requestEnvelope.request.intent.slots;
        
        const op = slot.operator.value;
        const attributesManager = handlerInput.attributesManager;
        
        const serviceClientFactory = handlerInput.serviceClientFactory;
 	    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
        
         let userTimeZone;
        
         try{
            const upsServiceClient = serviceClientFactory.getUpsServiceClient();
            userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
        }catch(error){
            if(error.name !== 'ServiceError'){
                return handlerInput.responseBuilder.speak("There was a problem connecting with the service.").getResponse();
            }
            console.log('error'.error.message);
        }
        console.log('userTimeZone', userTimeZone);
        
         const currentDateTime = new Date(new Date().toLocaleString('en-US',{timeZone : userTimeZone}));
        
        const currentTime = new Date(currentDateTime.getHours(),currentDateTime.getMinutes());
        const currentDate = new Date(currentDateTime.getFullYear(),currentDateTime.getMonth(), currentDateTime.getDate());
        
    
        
        const opDynamoAttr = {
            TableName : opTable,
            Item: {
            "UserId" : userId,
            "operation" : op,
            "timestamp" : currentDateTime.toString
            }
        };
        
        dbPut(opDynamoAttr);
        console.log('Added Session Attributes as a new record');
        var answer = calculate(handlerInput);
            
		const response = handlerInput.responseBuilder;

		

		return response 
		           .speak(answer)
		           .reprompt(answer)
		           .getResponse();


	},
};






const ExitHandler = {
	canHandle(handlerInput){
		console.log("Inside ExitHandler");
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		const request = handlerInput.requestEnvelope.request;

		return request.type === 'IntentRequest' && (
				request.intent.name === 'AMAZON.StopIntent' || 
				request.intent.name === 'AMAZON.PauseIntent' ||
				request.intent.name === 'AMAZON.CancelIntent'
			);
	},
	handle(handlerInput){
		return handlerInput.responseBuilder
			.speak(exitSkillMessage) 
			.getResponse();
	},
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.standard();
const welcomeMessage = `Welcome to the Audio Calci. This Alexa Skill is brought to you by AlgoAsylum. You can ask me what is two plus two and likewise similar math questions.`;
const helpMessage = `What would you like to calculate?`;
const exitSkillMessage = `Thank you for using this skill. We at AlgoAsylum would love to have your feedback, please leave it at the comments section! See you soon!`;


function calculate(handlerInput){
	console.log("I am in calculate()");

	const forslots = handlerInput.requestEnvelope.request.intent.slots;
	var result = 0;
	const operator = forslots.operator.value;
	const number = forslots.number.value;
	const numbertwo = forslots.numbertwo.value;

	
    const div = ["divide","divides","by"];
    const mul = ["multiplies","times","into","multiplied by"];
    const min = ["minus","subtracting","subtract"];
    const plus = ["plus","add"];
    
    if(div.includes(operator)){
        
        if(parseInt(numbertwo)===0)
        {
            return "divide by zero error";
        }
        else if (parseInt(number)===0)
        {
            result = 0;
        }
        else
        {
    	    result = parseInt(number)/parseInt(numbertwo);
        }
    }
    else if(mul.includes(operator)){
    	result = parseInt(number)*parseInt(numbertwo);
    }
    else if(plus.includes(operator)){
    	result = parseInt(number)+parseInt(numbertwo);
    }
    else if(min.includes(operator)){
    	result = parseInt(number)-parseInt(numbertwo);
    }
    else
    {
    	return "I did not get it. Please repeat.";
    }

    result = result.toString();
    result = number + ` ` + operator + ` ` + numbertwo + ` equals ` + result;
    
    
    
        
	
	return result;
}


exports.handler = skillBuilder
	.addRequestHandlers(
	    StatsHandler,
		LaunchRequestHandler,
		MathHandler,
		ExitHandler,
		SessionEndedRequestHandler)
	.lambda();
	
	
	
