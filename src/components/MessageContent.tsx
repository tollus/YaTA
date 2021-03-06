import _ from 'lodash'
import * as React from 'react'

import LogType from 'constants/logType'
import { WithNameColorProps } from 'libs/Chatter'
import { HighlightColors } from 'libs/Highlight'
import { SerializedMessage } from 'libs/Message'
import styled, { prop, theme } from 'styled'

/**
 * Message component.
 */
const Message = styled.span<WithNameColorProps>`
  color: ${prop('color')};
  word-wrap: break-word;

  .emoteWrapper {
    display: inline-block;
    min-height: 28px;
    min-width: 28px;
    text-align: center;
  }

  .emote {
    display: inline-block;
    margin-top: -3px;
    vertical-align: middle;
  }

  img:-moz-loading,
  img:-moz-broken {
    height: 28px;
    width: 28px;
    overflow-x: hidden;
  }

  .mention {
    background-color: ${theme('log.mention.color')};
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    &.self {
      background-color: ${theme('log.mention.self.color')};
    }
  }

  span.cheer {
    font-weight: bold;
  }

  .highlight {
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    ${(props) => {
      let rules = ''

      for (const highlightColor in HighlightColors) {
        if (HighlightColors.hasOwnProperty(highlightColor)) {
          rules += `
            &.${highlightColor} {
              background-color: ${theme(`log.highlight.${highlightColor}.background`)(props)};
              color: ${theme(`log.highlight.${highlightColor}.color`)(props)};
            }
          `
        }
      }

      return rules
    }};
  }
`

/**
 * MessageContent Component.
 */
const MessageContent: React.SFC<Props> = ({ message }) => {
  const isAction = message.type === LogType.Action
  const messageColor = isAction && !_.isNil(message.user.color) ? message.user.color : 'inherit'

  return <Message color={messageColor} dangerouslySetInnerHTML={{ __html: message.message }} />
}

export default MessageContent

/**
 * React Props.
 */
interface Props {
  message: SerializedMessage
}
