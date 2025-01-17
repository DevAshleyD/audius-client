/* globals fetch, File */
import React, { useState, useCallback, useEffect } from 'react'

import cn from 'classnames'

import { MAIN_CONTENT_ID } from 'containers/App'
import ProfileForm from 'containers/sign-on/components/ProfileForm'
import TwitterOverlay from 'containers/sign-on/components/mobile/TwitterOverlay'
import {
  formatInstagramProfile,
  formatTwitterProfile
} from 'containers/sign-on/utils/formatSocialProfile'
import { InstagramProfile, TwitterProfile } from 'store/account/reducer'

import styles from './ProfilePage.module.css'

const messages = {
  header: 'Tell Us About Yourself So Others Can Find You'
}

type ProfilePageProps = {
  profileImage?: { file: any; url: string }
  twitterId: any
  isVerified: boolean
  name: { value: any; status: any; error: any }
  handle: { value: any; status: any; error: any }
  onNextPage: () => void
  setTwitterProfile: (
    uuid: string,
    profile: any,
    profileImg?: { url: string; file: any },
    coverBannerImg?: { url: string; file: any },
    skipEdit?: boolean
  ) => void
  setInstagramProfile: (
    uuid: string,
    profile: InstagramProfile,
    profileImg?: { url: string; file: any },
    skipEdit?: boolean
  ) => void
  onHandleChange: (handle: string) => void
  onNameChange: (name: string) => void
  setProfileImage: (img: { url: string; file: any }) => void
  validateHandle: (
    handle: string,
    onValidate?: (error: boolean) => void
  ) => void
}

const ProfilePage = (props: ProfilePageProps) => {
  // If the handle field is disabled, don't let the user twitter auth
  const [showTwitterOverlay, setShowTwitterOverlay] = useState(
    props.handle.status !== 'disabled'
  )
  const [isInitial, setIsInitial] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const setLoading = useCallback(() => setIsLoading(true), [setIsLoading])
  const setFinishedLoading = useCallback(() => setIsLoading(false), [
    setIsLoading
  ])

  /**
   * The margin top causes a secondary scroll for mobile web causing the container to be larger than 100vh
   * This removes the margin top to make the container height 100vh
   */
  useEffect(() => {
    const mainContent = document.getElementById(MAIN_CONTENT_ID)
    if (mainContent) {
      mainContent.classList.add(styles.removeMarginTop)
      return () => {
        mainContent.classList.remove(styles.removeMarginTop)
      }
    }
  }, [])

  const {
    name,
    handle,
    isVerified,
    profileImage,
    setProfileImage,
    onHandleChange,
    onNameChange,
    onNextPage,
    twitterId,
    setTwitterProfile,
    setInstagramProfile,
    validateHandle
  } = props

  const onToggleTwitterOverlay = useCallback(() => {
    setShowTwitterOverlay(show => !show)
    setIsInitial(false)
  }, [])

  const getProfileValid = useCallback(() => {
    return (
      name.value &&
      (handle.status === 'success' || handle.status === 'disabled')
    )
  }, [name, handle])

  const onContinue = useCallback(() => {
    if (getProfileValid()) onNextPage()
  }, [getProfileValid, onNextPage])

  const onTwitterLogin = async (twitterProfileRes: Body) => {
    const { uuid, profile: twitterProfile } = await twitterProfileRes.json()
    try {
      const {
        profile,
        profileImage,
        profileBanner,
        requiresUserReview
      } = await formatTwitterProfile(twitterProfile)

      validateHandle(profile.screen_name, (error: boolean) => {
        setTwitterProfile(
          uuid,
          profile,
          profileImage,
          profileBanner,
          !error && !requiresUserReview
        )
        setShowTwitterOverlay(false)
        setIsInitial(false)
        setIsLoading(false)
      })
    } catch (err) {
      console.error(err)
      setShowTwitterOverlay(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onInstagramLogin = async (
    uuid: string,
    instagramProfile: InstagramProfile
  ) => {
    try {
      const {
        profile,
        profileImage,
        requiresUserReview
      } = await formatInstagramProfile(instagramProfile)
      validateHandle(profile.username, (error: boolean) => {
        setInstagramProfile(
          uuid,
          profile,
          profileImage,
          !error && !requiresUserReview
        )
      })
    } catch (err) {
      // Continue if error
    } finally {
      setShowTwitterOverlay(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onHandleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === 13 /** enter */) {
        onContinue()
      }
    },
    [onContinue]
  )

  const canUpdateHandle = !(
    isVerified &&
    twitterId &&
    handle.status === 'success'
  )
  const profileValid = getProfileValid()
  return (
    <div className={cn(styles.container)}>
      <div
        className={cn(styles.profileContentContainer, {
          [styles.authOverlay]: showTwitterOverlay
        })}
      >
        <TwitterOverlay
          header={messages.header}
          isMobile
          initial={isInitial}
          onClick={setLoading}
          isLoading={isLoading}
          onFailure={setFinishedLoading}
          showTwitterOverlay={showTwitterOverlay}
          onTwitterLogin={onTwitterLogin}
          onInstagramLogin={onInstagramLogin}
          onToggleTwitterOverlay={onToggleTwitterOverlay}
        />
        <ProfileForm
          isMobile
          header={messages.header}
          showTwitterOverlay={showTwitterOverlay}
          profileImage={profileImage}
          name={name}
          onTwitterLogin={onTwitterLogin}
          onToggleTwitterOverlay={onToggleTwitterOverlay}
          canUpdateHandle={canUpdateHandle}
          handle={handle}
          setProfileImage={setProfileImage}
          profileValid={profileValid}
          onHandleKeyDown={onHandleKeyDown}
          onHandleChange={onHandleChange}
          onNameChange={onNameChange}
          onContinue={onContinue}
        />
      </div>
    </div>
  )
}

export default ProfilePage
