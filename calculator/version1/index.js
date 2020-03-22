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

		const response = handlerInput.responseBuilder;

		

		var answer = calculate(handlerInput);

		
		
		return response 
		           .speak(answer)
                   .getResponse();


	},
};

const skillBuilder = Alexa.SkillBuilders.custom();
const welcomeMessage = `Welcome to the Alexa Calculator, you can ask me what is two plus two and likewise similar math questions.`;
const helpMessage = `What would you like to calculate?`;


function calculate(handlerInput){
	console.log("I am in calculate()");

	const forslots = handlerInput.requestEnvelope.request.intent.slots;

	if(forslots.operator.value === 'plus')
	{
		var result = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value)+parseInt(handlerInput.requestEnvelope.request.intent.slots.numbertwo.value);
	}
	else if(forslots.operator.value === 'minus')
	{
		var result = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value)-parseInt(handlerInput.requestEnvelope.request.intent.slots.numbertwo.value);
	}
	else if(forslots.operator.value === 'multiply')
	{
		var result = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value)*parseInt(handlerInput.requestEnvelope.request.intent.slots.numbertwo.value);
	}
	else
	{
		var result = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value)/parseInt(handlerInput.requestEnvelope.request.intent.slots.numbertwo.value);
	}

    result = forslots.number.value + forslots.operator.value + forslots.numbertwo.value + ` equals ` + answer.toString();
	
	return result;
}
exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		MathHandler)
	.lambda();
