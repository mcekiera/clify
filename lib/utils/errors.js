class InvalidArgsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidArgsError';
  }
}

async function withInvalidArgsErrorHandling(func) {
  let isValid = false;
  let result = null;

  while(!isValid) {
    try {
      result = await func();
      isValid = true;
    } catch (error) {
      if(error instanceof InvalidArgsError) {
        console.error(`Invalid arg: ${error.message}`)
      } else {
        throw error;
      }
    }
  }

  return result;
}



module.exports = {
  InvalidArgsError,
  withInvalidArgsErrorHandling
};