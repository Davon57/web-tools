import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// 创建AJV实例
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  allowMatchingProperties: true,
  allowUnionTypes: true
})

// 添加格式支持
addFormats(ajv)

// 错误信息本地化
const errorMessages = {
  'type': '类型错误',
  'required': '缺少必填字段',
  'additionalProperties': '不允许的额外属性',
  'format': '格式错误',
  'minimum': '值太小',
  'maximum': '值太大',
  'minLength': '长度太短',
  'maxLength': '长度太长',
  'pattern': '格式不匹配',
  'enum': '值不在允许范围内',
  'const': '值不匹配常量',
  'multipleOf': '不是指定倍数',
  'uniqueItems': '数组元素不唯一',
  'minItems': '数组元素太少',
  'maxItems': '数组元素太多',
  'minProperties': '对象属性太少',
  'maxProperties': '对象属性太多'
}

// JSON语法错误类型定义
export class JsonSyntaxError extends Error {
  constructor(message, position, line, column, context) {
    super(message)
    this.name = 'JsonSyntaxError'
    this.position = position
    this.line = line
    this.column = column
    this.context = context
  }
}

// JSON校验错误类型定义
export class JsonValidationError extends Error {
  constructor(message, errors) {
    super(message)
    this.name = 'JsonValidationError'
    this.errors = errors
  }
}

// 计算行号和列号
function getLineAndColumn(jsonString, position) {
  const lines = jsonString.substring(0, position).split('\n')
  const line = lines.length
  const column = lines[lines.length - 1].length + 1
  return { line, column }
}

// 获取错误上下文
function getErrorContext(jsonString, position, contextSize = 20) {
  const start = Math.max(0, position - contextSize)
  const end = Math.min(jsonString.length, position + contextSize)
  const context = jsonString.substring(start, end)
  const pointer = ' '.repeat(position - start) + '^'
  return {
    before: jsonString.substring(start, position),
    after: jsonString.substring(position, end),
    pointer,
    full: `${context}\n${pointer}`
  }
}

// 解析JSON并捕获语法错误
export function parseJsonWithValidation(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    return {
      success: true,
      data: parsed,
      error: null
    }
  } catch (error) {
    const position = error.position || (error.message.match(/position (\d+)/)?.[1] ? parseInt(error.message.match(/position (\d+)/)[1]) : 0)
    const { line, column } = getLineAndColumn(jsonString, position)
    const context = getErrorContext(jsonString, position)
    
    const syntaxError = new JsonSyntaxError(
      error.message,
      position,
      line,
      column,
      context
    )
    
    return {
      success: false,
      data: null,
      error: {
        type: 'syntax',
        message: error.message,
        position,
        line,
        column,
        context: context.full,
        raw: syntaxError
      }
    }
  }
}

// 验证JSON数据结构
export function validateJsonStructure(data, schema = null) {
  try {
    // 如果没有提供schema，使用默认的宽松验证
    if (!schema) {
      // 基本验证：确保是对象或数组
      if (typeof data !== 'object' || data === null) {
        return {
          success: false,
          errors: [{
            type: 'structure',
            message: 'JSON数据必须是对象或数组',
            path: '',
            value: data
          }]
        }
      }
      
      return {
        success: true,
        errors: []
      }
    }
    
    // 使用提供的schema进行验证
    const validate = ajv.compile(schema)
    const valid = validate(data)
    
    if (!valid) {
      const errors = validate.errors.map(error => ({
        type: error.keyword,
        message: error.message || getErrorMessage(error),
        path: error.instancePath || error.dataPath,
        value: error.data,
        params: error.params,
        schema: error.schemaPath
      }))
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: true,
      errors: []
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        type: 'validation',
        message: `验证过程出错: ${error.message}`,
        path: '',
        value: data,
        error: error
      }]
    }
  }
}

// 获取错误消息
function getErrorMessage(error) {
  const keyword = error.keyword
  const params = error.params
  
  if (errorMessages[keyword]) {
    let message = errorMessages[keyword]
    
    // 替换参数
    if (params) {
      Object.keys(params).forEach(key => {
        message = message.replace(`{${key}}`, params[key])
      })
    }
    
    return message
  }
  
  return error.message || '未知错误'
}

// 格式化错误消息
export function formatValidationErrors(errors) {
  if (!errors || errors.length === 0) {
    return '无错误'
  }
  
  return errors.map((error, index) => {
    let message = `${index + 1}. `
    
    if (error.path) {
      message += `路径 "${error.path}": `
    }
    
    message += error.message
    
    if (error.value !== undefined) {
      message += ` (值: ${JSON.stringify(error.value)})`
    }
    
    return message
  }).join('\n')
}

// 完整的JSON校验
export function validateJson(jsonString, schema = null) {
  // 第一步：语法校验
  const parseResult = parseJsonWithValidation(jsonString)
  
  if (!parseResult.success) {
    return parseResult
  }
  
  // 第二步：结构校验
  const validationResult = validateJsonStructure(parseResult.data, schema)
  
  if (!validationResult.success) {
    return {
      success: false,
      data: parseResult.data,
      error: {
        type: 'validation',
        message: formatValidationErrors(validationResult.errors),
        errors: validationResult.errors,
        formattedMessage: formatValidationErrors(validationResult.errors)
      }
    }
  }
  
  return {
    success: true,
    data: parseResult.data,
    error: null
  }
}

// 获取JSON路径值
export function getJsonPathValue(data, path) {
  if (!path) return data
  
  const keys = path.split('.').filter(key => key !== '')
  let current = data
  
  for (const key of keys) {
    // 处理数组索引
    if (key.match(/^\[(\d+)\]$/)) {
      const index = parseInt(key.match(/^\[(\d+)\]$/)[1])
      if (Array.isArray(current) && index < current.length) {
        current = current[index]
      } else {
        return undefined
      }
    } else {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
  }
  
  return current
}

// 设置JSON路径值
export function setJsonPathValue(data, path, value) {
  if (!path) return
  
  const keys = path.split('.').filter(key => key !== '')
  let current = data
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    
    if (key.match(/^\[(\d+)\]$/)) {
      const index = parseInt(key.match(/^\[(\d+)\]$/)[1])
      if (Array.isArray(current) && index < current.length) {
        current = current[index]
      } else {
        return false
      }
    } else {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return false
      }
    }
  }
  
  const lastKey = keys[keys.length - 1]
  
  if (lastKey.match(/^\[(\d+)\]$/)) {
    const index = parseInt(lastKey.match(/^\[(\d+)\]$/)[1])
    if (Array.isArray(current) && index < current.length) {
      current[index] = value
      return true
    }
  } else {
    if (current && typeof current === 'object') {
      current[lastKey] = value
      return true
    }
  }
  
  return false
}

export default {
  validateJson,
  parseJsonWithValidation,
  validateJsonStructure,
  formatValidationErrors,
  getJsonPathValue,
  setJsonPathValue,
  JsonSyntaxError,
  JsonValidationError
}