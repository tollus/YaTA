import { InputGroup } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'

import Follow from 'Components/Follow'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { RawFollow } from 'Libs/Twitch'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  border-top: 1px solid ${color('follows.border')};
  height: calc(100% - 50px);
  overflow-x: hidden;
  overflow-y: auto;
`

/**
 * Grid component.
 */
const Grid = styled.div`
  display: grid;
  grid-auto-rows: ${size('follows.height')};
  grid-column-gap: ${size('follows.margin')};
  grid-row-gap: ${size('follows.margin')};
  grid-template-columns: repeat(auto-fit, minmax(${size('follows.width')}, 1fr));
  padding: ${size('follows.margin')};
`

/**
 * Search component.
 */
const Search = styled(InputGroup)`
  margin: 10px;
`

/**
 * React State.
 */
const initialState = {
  error: undefined as Error | undefined,
  filter: '',
  filteredFollows: null as RawFollow[] | null,
  follows: null as RawFollow[] | null,
}
type State = Readonly<typeof initialState>

/**
 * Follows Component.
 */
class Follows extends React.Component<RouteComponentProps<{}>, State> {
  public state: State = initialState
  private search: HTMLInputElement | null = null

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const follows = await Twitch.fetchFollows()

      this.setState(
        () => ({ follows }),
        () => {
          if (!_.isNil(this.search)) {
            this.search.focus()
          }
        }
      )
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { error, follows } = this.state

    if (!_.isNil(error)) {
      throw error
    }

    if (_.isNil(follows)) {
      return <Spinner large />
    }

    if (follows.length === 0) {
      return (
        <NonIdealState
          title="Looks like you're alone!"
          details={
            <>
              Maybe try to find streamers you like on <a href="https://twitch.tv">Twitch</a>.
            </>
          }
        />
      )
    }

    const { filter, filteredFollows } = this.state

    const followsToRender = filter.length > 0 && !_.isNil(filteredFollows) ? filteredFollows : follows

    return (
      <>
        <Search
          placeholder="Filter…"
          type="search"
          leftIcon="search"
          value={filter}
          onChange={this.onChangeFilter}
          inputRef={this.setSearchElementRef}
        />
        <Wrapper>
          <Grid>
            {_.map(followsToRender, (follow) => (
              <Follow key={follow._id} follow={follow} goToChannel={this.goToChannel} />
            ))}
          </Grid>
        </Wrapper>
      </>
    )
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    let filteredFollows: RawFollow[] | null = null

    const { follows } = this.state

    if (!_.isNil(follows) && filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredFollows = _.filter(follows, (follow) => {
        const name = Twitch.isStream(follow) ? follow.channel.name : follow.name
        const title = _.defaultTo(Twitch.isStream(follow) ? follow.channel.status : follow.status, '')

        return name.includes(sanitizedFilter) || title.toLowerCase().includes(sanitizedFilter)
      })
    }

    this.setState(() => ({ filter, filteredFollows }))
  }

  /**
   * Go to a specific channel.
   */
  private goToChannel = (channel: string) => {
    this.props.history.push(`/${channel}`)
  }

  /**
   * Sets the search input ref.
   * @param ref - The reference to the inner input element.
   */
  private setSearchElementRef = (ref: HTMLInputElement | null) => {
    this.search = ref
  }
}

export default withRouter(Follows)
