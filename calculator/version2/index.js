

const Alexa = require('ask-sdk-core');

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

const MathHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;

		console.log("Inside MathHandler - canHandle");
		console.log(JSON.stringify(request));

		return request.type === "IntentRequest" &&
			(request.intent.name === "DoMath");
	},
	handle(handlerInput){
		console.log("Inside MathHandler - handle");

		const attributes = handlerInput.attibutesManager.getSessionAttributes();

		attributes.state = states.CALC; 

		const response = handlerInput.responseBuilder;

		var answer = calculate(handlerInput);

		return response 
		           .speak(answer)
		           .reprompt(answer)
		           .getResponse();


	},
};

const StatsHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		console.log("Inside StatsHandler");
		console.log(JSON.stringify(request));

		return request.type === "IntentRequest" &&
				(request.intent.name === 'StatsIntent')

	}
}

const ExitHandler = {
	canHandle(handlerInput){
		console.log("Inside ExitHandler");
		const attributes = handlerInput.attibutesManager.getSessionAttributes();
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
}

const skillBuilder = Alexa.SkillBuilders.custom();
const welcomeMessage = `Welcome to Audio Calci. This skill is brought to you by AlgoAsylum. You can ask me what is two plus two and likewise similar math questions.`;
const helpMessage = `What would you like to calculate?`;
const exitSkillMessage = `Thank you for using this skill. We at AlgoAsylum would love to have your feedback, please leave it at the comments section! See you soon!`;


const states = {
	START : '_START',
	CALC : '_CALC',
};

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
		LaunchRequestHandler,
		MathHandler,
		ExitHandler)
	.lambda();
