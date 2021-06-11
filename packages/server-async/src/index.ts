import AsyncApp from './application'
import compose from './compose'

import logger from './public-middleware/logger'
import responseTime from './public-middleware/response-time'

export *  from './type'

const middleware = {
    logger,
    responseTime
}

export {
    compose,
    AsyncApp,
    middleware
}

export default AsyncApp