"use client"

import type { Dictionary } from "@/lang"
import { CreateEventPageDataType } from "@/app/(normal)/event/[grouphandle]/create/data"
import { useEffect, useRef, useState } from "react"
import { Button, buttonVariants } from "@/components/shadcn/Button"
import useUploadImage from "@/hooks/useUploadImage"
import { Input } from "@/components/shadcn/Input"
import dynamic from "next/dynamic"
import { Switch } from "@/components/shadcn/Switch"
import LocationInput from "@/components/client/LocationInput"
import {
  checkTrackSuitable,
  eventCoverTimeStr,
  isEventTimeSuitable,
} from "@/utils"
import SelectedEventHost from "@/components/client/SelectedEventHost"
import useModal from "@/components/client/Modal/useModal"
import SelectedEventBadge from "@/components/client/SelectedEventBadge"
import EventRoleInput from "@/components/client/EventRoleInput"
import TicketForm, {
  Checker,
} from "@/app/(normal)/event/[grouphandle]/create/TicketForm"
import RepeatForm, {
  RepeatFormType,
} from "@/app/(normal)/event/[grouphandle]/create/RepeatForm"
import TracksFilter from "@/components/client/TracksFilter"
import TagsFilter from "@/components/client/TagsFilter"
import { getOccupiedTimeEvent, Event, EventDraftType, EventKind } from "@sola/sdk"
import { CLIENT_MODE } from "@/app/config"
import { scrollToErrMsg } from "@/components/client/Subscription/uilts"
import dayjs from "@/libs/dayjs"
import { isEdgeCityGroup, eventKinds } from "@/app/configForSpecifyGroup"
import useExternalEvent from "@/hooks/useExternalEvent"
import useConfirmDialog from "@/hooks/useConfirmDialog"
import { EditorRef } from "@/components/client/Editor/RichTextEditor"
import RequirementTagsSelector from "@/components/client/RequirementTagsSelector"
import DropdownMenu from "@/components/client/DropdownMenu"

const RichTextEditorDynamic = dynamic(
  () => import("@/components/client/Editor/RichTextEditor"),
  { ssr: false },
)
const EventDateTimeInput = dynamic(
  () => import("@/components/client/EventDateTimeInput"),
  { ssr: false },
)

export interface EventFormProps {
  lang: Dictionary
  data: CreateEventPageDataType
  onConfirm?: (eventDraft: EventDraftType, repeatOpt: RepeatFormType) => void
  onCancel?: (eventDraft: EventDraftType, repeatOpt: RepeatFormType) => void
}

export default function EventForm({
  lang,
  data,
  onConfirm,
  onCancel,
}: EventFormProps) {
  const [draft, setDraft] = useState(data.eventDraft)
  const { uploadImage } = useUploadImage()
  const { showLoading, closeModal } = useModal()
  const { showConfirmDialog } = useConfirmDialog()
  const ticketCheckerRef = useRef<Checker>({ check: undefined })

  // ui
  const [enableNote, setEnableNote] = useState(!!draft.notes)
  const [enableMoreSetting, setEnableMoreSetting] = useState(false)
  const [enableTicket, setEnableTicket] = useState(!!draft.tickets?.length)

  // repeat form
  const [repeatForm, setRepeatForm] = useState<RepeatFormType>({
    interval: data.recurring?.interval || null,
    event_count: data.recurring?.event_count || 1,
  })

  //editor ref
  const contentEditorRef = useRef<EditorRef>(null)

  // errors
  const [timeError, setTimeError] = useState("")
  const [trackDayError, setTrackDayError] = useState("")
  const [occupiedEvent, setOccupiedEvent] = useState<Event | null>(null)
  const [tagError, setTagError] = useState("")
  const [titleError, setTitleError] = useState("")

  const setCover = async () => {
    const picUrl = await uploadImage()
    setDraft({ ...draft, cover_url: picUrl })
  }

  useEffect(() => {
    console.log("draft", draft)
    console.log("repeatForm", repeatForm)
    // onConfirm?.(draft, repeatForm)
  }, [draft, repeatForm])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currUrl = new URL(window.location.href)
      const preset_event_badge = currUrl.searchParams.get("event_badge")
      if (preset_event_badge) {
        setEnableMoreSetting(true)
        setTimeout(() => {
          document
            .querySelector('div[test-id="selected-event-badge"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 400)
      }
    }
  }, [])

  useEffect(() => {
    (async () => {
      const venue = data.venues.find((v) => v.id === draft.venue_id)
      const errorMsg = isEventTimeSuitable(
        draft.timezone!,
        draft.start_time!,
        draft.end_time!,
        data.isGroupManager,
        data.isGroupMember,
        venue,
      )
      setTimeError(lang[errorMsg as keyof Dictionary])

      const loading = showLoading()
      try {
        const occupiedEvents = await getOccupiedTimeEvent({
          params: {
            startTime: draft.start_time,
            endTime: draft.end_time,
            timezone: draft.timezone!,
            venueId: draft.venue_id,
            excludeEventId: draft.id,
          },
          clientMode: CLIENT_MODE,
        })

        setOccupiedEvent(occupiedEvents)
      } catch (e: unknown) {
        console.error(e)
      } finally {
        closeModal(loading)
      }
    })()
  }, [
    draft.end_time,
    draft.id,
    draft.start_time,
    draft.timezone,
    draft.venue_id,
  ])

  useEffect(() => {
    setTagError(
      !!draft.tags && draft.tags.filter((t) => !t.startsWith(":")).length > 10
        ? lang["The maximum number of tags is 10"]
        : "",
    )
  }, [draft.tags])

  useEffect(() => {
    setTrackDayError(
      draft.track_id
        ? checkTrackSuitable(
          draft,
          data.tracks.find((t) => t.id === draft.track_id)!,
        )
        : "",
    )
  }, [draft.track_id, draft.start_time, draft.end_time, draft.timezone])

  const handleConfirm = async () => {
    if (!draft.title) {
      setTitleError(lang["Event Name is required"])
      scrollToErrMsg()
      return
    } else {
      setTitleError("")
    }

    if (
      !!timeError ||
      !!tagError ||
      !!occupiedEvent ||
      !!trackDayError ||
      (ticketCheckerRef.current.check && !ticketCheckerRef.current.check())
    ) {
      scrollToErrMsg()
      return
    }

    const _draft = { ...draft }
    if (!enableTicket) {
      _draft.tickets = []
    }

    onConfirm?.(draft, repeatForm)
  }

  const handleCancelEvent = async () => {
    onCancel?.(draft, repeatForm)
  }

  const updateRequirementTags = (tag: string) => {
    if (draft.requirement_tags?.includes(tag)) {
      setDraft({
        ...draft,
        requirement_tags: draft.requirement_tags.filter((t) => t !== tag),
      })
    } else {
      setDraft({
        ...draft,
        requirement_tags: [...(draft.requirement_tags || []), tag],
      })
    }
  }

  const { getLumaEvent } = useExternalEvent()

  const handleImportLumaEvent = async () => {
    const eventData = await getLumaEvent(lang)
    if (!eventData) {
      return
    }
    console.log("luma event data", eventData)
    setDraft({ ...draft, ...eventData })
    if (contentEditorRef.current) {
      contentEditorRef.current.initText?.(eventData.content || "")
    }
    showConfirmDialog({
      lang: lang,
      title: lang["External Event Imported Successfully"],
      content:
        lang[
        "Importing external event details will disregard ticket information and online meeting addresses. Please manually edit these details."
        ],
      type: "info",
      hiddenCancelBtn: true,
    })
  }

  return (
    <div className="min-h-[100svh] w-full">
      <div className="page-width min-h-[100svh] px-3 pt-0 !pb-16">
        <div className="pt-4 sm:pt-6 sm:pb-10 font-semibold text-center text-xl relative">
          {draft.id ? lang["Edit Event"] : lang["Create Event"]}

          {!draft.id && (
            <Button
              variant={"ghost"}
              size={"xs"}
              onClick={handleImportLumaEvent}
              className="!block !sm:inline sm:absolute mt-1 sm:mt-0 right-0 top-6 text-sm !text-blue-500"
            >
              <div className="flex-row-item-center">
                <i className="uil-plus-circle mr-1 text-base" />
                <span>{lang["Import External Event"]}</span>
              </div>
            </Button>
          )}

          {!!draft.id && draft.status !== "cancelled" && (
            <Button
              onClick={handleCancelEvent}
              variant={"secondary"}
              size={"sm"}
              className="absolute right-0 text-sm !text-red-500"
            >
              {lang["Cancel Event"]}
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center sm:items-start sm:flex-row w-full">
          <div className="sm:order-2 mt-4 sm:mt-0 mb-8">
            {!draft.cover_url ? (
              <div className="mb-4 flex-shrink-0 w-[324px] h-[324px] overflow-hidden mx-auto">
                <div
                  className="default-cover w-[452px] h-[452px]"
                  style={{ transform: "scale(0.72)" }}
                >
                  <div className="webkit-box-clamp-2 font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                    {draft.title || lang["Event Name"]}
                  </div>
                  <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                    {eventCoverTimeStr(draft.start_time!, draft.timezone!).date}
                    <br />
                    {eventCoverTimeStr(draft.start_time!, draft.timezone!).time}
                  </div>
                  <div className="text-lg absolute font-semibold left-[76px] top-[240px]">
                    {draft.location}
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={draft.cover_url}
                alt=""
                className="w-[324px] h-auto mb-4"
              />
            )}
            <Button
              onClick={setCover}
              variant={"secondary"}
              className="block btn mx-auto w-[324px]"
            >
              {lang["Upload Cover"]}
            </Button>
          </div>

          <div className="sm:order-1 sm:mr-8 flex-1 max-w-[644px]">
            {!!data.tracks.length && (
              <>
                <div className="font-semibold mb-1">
                  {lang["Event Programs"]}
                </div>
                <div className="mb-8">
                  <TracksFilter
                    lang={lang}
                    allowResetBtn={false}
                    tracks={data.tracks}
                    values={draft.track_id ? [draft.track_id] : undefined}
                    onSelect={(trackIds) => {
                      setDraft({ ...draft, track_id: trackIds?.[0] || null })
                    }}
                  />
                </div>
              </>
            )}

            <div className="mb-8">
              <div className="font-semibold mb-1">
                {lang["Event Name"]} <span className="text-red-500">*</span>
              </div>
              <Input
                className="w-full"
                placeholder={lang["Input event name"]}
                value={draft.title}
                required
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              {!!titleError && (
                <div className="text-red-400 mt-2 text-xs err-msg">
                  {titleError}
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="font-semibold mb-1">
                {lang["Kind(Optional)"]}
              </div>
              <DropdownMenu
                options={eventKinds}
                value={draft.kind ? eventKinds.filter(k => k.value === draft.kind) : undefined}
                onSelect={(kind) => setDraft({ ...draft, kind: kind[0].value as EventKind })}
                renderOption={(option) => option.label}
                valueKey="value">
                <Input
                  readOnly
                  endAdornment={<img src="/images/dropdown_icon.svg" alt="" />}
                  value={draft.kind || ''}
                  className="w-full"
                  placeholder={lang['Select Kind']} />
              </DropdownMenu>
            </div>

            <div className="mb-8">
              <div className="font-semibold mb-1">
                {lang["When will it happen"]}
              </div>
              <EventDateTimeInput
                lang={lang}
                venues={data.venues}
                state={{ event: draft, setEvent: setDraft }}
              />
              <RepeatForm
                  disabled={!!draft.id}
                  lang={lang}
                  event={draft}
                  repeatForm={repeatForm}
                  onChange={(repeatForm) => setRepeatForm(repeatForm)}
                />
              {!!timeError && (
                <div className="text-red-400 mt-2 text-xs err-msg">
                  {timeError}
                </div>
              )}
              {!!trackDayError && (
                <div className="text-red-400 mt-2 text-xs err-msg">
                  {trackDayError}
                </div>
              )}
              {!!occupiedEvent && (
                <div className="text-red-400 mt-2 text-xs err-msg">
                  {
                    lang[
                    "The selected time slot is occupied by another event at the current venue. Occupying event:"
                    ]
                  }
                  <a
                    className="text-blue-400"
                    target="_blank"
                    href={`/event/detail/${occupiedEvent.id}`}
                  >
                    [{occupiedEvent.title}]
                  </a>
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="font-semibold mb-1">{lang["Location"]}</div>
              <LocationInput
                lang={lang}
                isManager={data.isGroupManager}
                isMember={data.isGroupMember}
                venues={data.venues}
                state={{ event: draft, setEvent: setDraft }}
              />
            </div>

            <div className="mb-8">
              <div className="font-semibold mb-1">{lang["Meeting URL"]}</div>
              <Input
                className="w-full"
                placeholder={lang["Input meeting url"]}
                onChange={(e) => {
                  setDraft({ ...draft, meeting_url: e.target.value })
                }}
                startAdornment={<i className="uil-link text-lg" />}
                value={draft.meeting_url || ""}
              />
            </div>

            <div className="font-semibold mb-1">
              {lang["Event Description"]}
            </div>
            <div className="mb-3 w-full min-h-[226px] bg-secondary rounded-lg">
              <RichTextEditorDynamic
                editorRef={contentEditorRef}
                initText={draft.content || ""}
                onChange={(md) => {
                  setDraft({ ...draft, content: md })
                }}
              />
            </div>

            <div className="mb-8">
              <div className={`select-none mb-3`}>
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="text-sm">
                    <div className="font-semibold">{lang["Event Note"]}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      {lang["Display after confirming attendance"]}
                    </div>
                  </div>
                  <Switch
                    onClick={() => {
                      setEnableNote(!enableNote)
                    }}
                    checked={enableNote}
                    aria-readonly
                  />
                </div>
              </div>
              <div
                id="event-notes"
                className={`${enableNote ? "" : "h-0"} overflow-hidden`}
              >
                <RichTextEditorDynamic
                  initText={draft.notes || ""}
                  onChange={(md) => {
                    setDraft({ ...draft, notes: md })
                  }}
                />
              </div>
            </div>

            {!!draft.venue_id && isEdgeCityGroup(draft.group_id) && (
              <RequirementTagsSelector event={draft} setEvent={setDraft} lang={lang} />
            )}

            {!!data.availableHost.length && (
              <div className="mb-8">
                <div className="font-semibold mb-1">{lang["Host"]}</div>
                <SelectedEventHost
                  lang={lang}
                  availableHost={data.availableHost}
                  state={{ event: draft, setEvent: setDraft }}
                />
              </div>
            )}

            <div className="mb-8">
              <div className="font-semibold">{lang["Custom Host"]}</div>
              <div className="text-xs text-gray-500 font-normal mb-2">
                {lang["When set, this appears as the event host."]}
              </div>
              <EventRoleInput
                lang={lang}
                multiple={false}
                state={{ event: draft, setEvent: setDraft }}
                role={"custom_host" as Solar.EventRoleType}
              />
            </div>

            {!!data.tags?.length && (
              <div className="mb-8">
                <div className="font-semibold mb-1">{lang["Tags"]}</div>
                <TagsFilter
                  allowResetBtn={false}
                  multiple={true}
                  tags={data.tags}
                  lang={lang}
                  onSelected={(tags) => {
                    setDraft({ ...draft, tags: tags?.length ? tags : null })
                  }}
                  values={draft.tags || []}
                />
                {!!tagError && (
                  <div className="text-red-400 mt-2 text-xs err-msg">
                    {tagError}
                  </div>
                )}
              </div>
            )}

            <div className="mb-8">
              <div className="font-semibold mb-1">
                {lang["Invite Co-hosts"]}
              </div>
              <EventRoleInput
                lang={lang}
                state={{ event: draft, setEvent: setDraft }}
                role={"co_host" as Solar.EventRoleType}
              />
            </div>

            <div className="mb-8">
              <div className="font-semibold mb-1">
                {lang["Invite Speakers"]}
              </div>
              <EventRoleInput
                lang={lang}
                state={{ event: draft, setEvent: setDraft }}
                role={"speaker" as Solar.EventRoleType}
              />
            </div>

            <div className="mb-8">
              <div className="flex flex-row items-center justify-between w-full mb-2">
                <div className="font-semibold">{lang["Ticket Setting"]}</div>
                <Switch
                  checked={enableTicket}
                  onClick={() => {
                    setEnableTicket(!enableTicket)
                  }}
                />
              </div>

              {enableTicket && (
                <>
                  <TicketForm
                    timezone={draft.timezone || dayjs.tz.guess()}
                    currProfile={data.currProfile}
                    lang={lang}
                    state={{ event: draft, setEvent: setDraft }}
                    tracks={data.tracks}
                    checker={ticketCheckerRef.current}
                  />
                </>
              )}
            </div>

            <div className="mb-8">
              <div className="border border-gray-200 rounded-lg">
                <div
                  onClick={() => {
                    setEnableMoreSetting(!enableMoreSetting)
                    setTimeout(() => {
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      })
                    }, 500)
                  }}
                  className={`${buttonVariants({ variant: "ghost" })} flex w-full justify-between items-center cursor-pointer`}
                >
                  <div className="font-semibold">{lang["More Settings"]}</div>

                  <div
                    className={`flex items-center ${enableMoreSetting ? "rotate-180" : ""}`}
                  >
                    {enableMoreSetting ? (
                      <i className="uil-sorting text-xl" />
                    ) : (
                      <i className="uil-direction text-xl" />
                    )}
                  </div>
                </div>

                <div
                  className={`transition-all overflow-hidden duration-500 ${enableMoreSetting ? "max-h-[1000px]" : "max-h-0"}`}
                >
                  <div className="p-4">
                    <div className="font-semibold mb-1 text-sm">
                      {lang["Event Badge"]}
                    </div>
                    {!!draft.id ? (
                      <>
                        <div className="text-gray-500 text-xs">
                          {
                            lang[
                            "When an event participant checks in, he or she automatically receives a badge at the end of the event"
                            ]
                          }
                        </div>
                        <SelectedEventBadge
                          currProfile={data.currProfile}
                          lang={lang}
                          state={{ event: draft, setEvent: setDraft }}
                        />
                      </>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        {lang["You can add a badge after creating an event"]}
                      </div>
                    )}

                    <div className="flex-row-item-center justify-between mt-8">
                      <div className="font-semibold mb-1 text-sm">
                        {lang["Maximum participants"]}
                      </div>
                      <Input
                        placeholder={"No limit"}
                        autoComplete={"off"}
                        className="!h-[2rem] w-[130px] text-sm"
                        type={"phone"}
                        onChange={(e) => {
                          setDraft({
                            ...draft,
                            max_participant: parseInt(e.target.value),
                          })
                        }}
                        value={draft.max_participant || ""}
                        endAdornment={
                          !!draft.max_participant ? (
                            <i
                              className="uil-times-circle text-lg cursor-pointer"
                              onClick={() => {
                                setDraft({ ...draft, max_participant: null })
                              }}
                            />
                          ) : (
                            <i className="uil-edit-alt text-lg" />
                          )
                        }
                      />
                    </div>

                    <div className="mt-8">
                      <div className="font-semibold mb-1 text-sm">
                        {lang["Display"]}
                      </div>
                      <div
                        onClick={() => {
                          setDraft({ ...draft, display: "normal" })
                        }}
                        className={`flex-row-item-center justify-between border cursor-pointer p-2 rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}
                      >
                        <div>
                          <div className="text-xs font-semibold">
                            {lang["Normal Event"]}
                          </div>
                          <div className="text-gray-500 text-xs font-normal">
                            {
                              lang[
                              "Select a normal event, the event you created is shown to all users."
                              ]
                            }
                          </div>
                        </div>
                        {draft.display === "normal" ? (
                          <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500" />
                        ) : (
                          <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500" />
                        )}
                      </div>
                      <div
                        onClick={() => {
                          setDraft({ ...draft, display: "private" })
                        }}
                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}
                      >
                        <div>
                          <div className="text-xs font-semibold">
                            {lang["Private Event"]}
                          </div>
                          <div className="text-gray-500 text-xs font-normal">
                            {
                              lang[
                              "Select a private event, the event you created can only be viewed through the link, and users can view the event in My Event page."
                              ]
                            }
                          </div>
                        </div>
                        {draft.display === "private" ? (
                          <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500" />
                        ) : (
                          <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500" />
                        )}
                      </div>
                      <div
                        onClick={() => {
                          setDraft({ ...draft, display: "public" })
                        }}
                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}
                      >
                        <div>
                          <div className="text-xs font-semibold">
                            {lang["Public Event"]}
                          </div>
                          <div className="text-gray-500 text-xs font-normal">
                            {
                              lang[
                              "Select a public event, the event you created is open to the public, even if the global setting is set to members-only visibility."
                              ]
                            }
                          </div>
                        </div>
                        {draft.display === "public" ? (
                          <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500" />
                        ) : (
                          <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500" />
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex-row-item-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            {lang["Highlighted"]}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {
                              lang[
                              "Select a highlight event, the event you created will display on the top of the day"
                              ]
                            }
                          </div>
                        </div>
                        <Switch
                          checked={draft.pinned}
                          onClick={() => {
                            setDraft({ ...draft, pinned: !draft.pinned })
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex-row-item-center justify-between">
                        <div>
                          <div className="font-semibold text-sm text-amber-500">
                            {lang["Close Event"]}
                          </div>
                          <div className="text-xs text-amber-500">
                            {
                              lang[
                              "People are no longer able to register for the event"
                              ]
                            }
                          </div>
                        </div>
                        <Switch
                          checked={draft.status === "closed"}
                          onClick={() => {
                            setDraft({
                              ...draft,
                              status:
                                draft.status === "closed"
                                  ? draft.status === "closed"
                                    ? "open"
                                    : draft.status
                                  : "closed",
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {draft.status !== "cancelled" ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={"secondary"}
                  className="w-full"
                  onClick={() => {
                    window.history.go(-1)
                  }}
                >
                  {lang["Back"]}
                </Button>
                <Button
                  variant={"special"}
                  className="w-full"
                  onClick={handleConfirm}
                >
                  {!draft.id ? lang["Create Event"] : lang["Save"]}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={"secondary"}
                  className="w-full"
                  onClick={() => {
                    window.history.go(-1)
                  }}
                >
                  {lang["Back"]}
                </Button>
                <Button
                  variant={"secondary"}
                  disabled={true}
                  className="w-full"
                >
                  {lang["Event Canceled"]}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
