import { Group } from "@sola/sdk"

// some of the requirement_tags for the edge city group
export const SeatingStyle = [
  "theater",
  "workshop",
  "single table + chairs",
  "Yoga mats",
]
// export const AVNeeds = ['presentation screen', 'microphone', 'speakers']
export const AVNeeds = [
  "projector/TV",
  "microphone",
  "speakers",
  "Projector/TV",
  "Microphone",
  "Speakers",
  "Soundsystem",
  "Whiteboard",
]
export const ExternalCatering = [
  "Time of delivery",
  "Kitchen needed",
  "food & beverages",
  "Cuttlery needed",
]

export const isEdgeCityGroup = (groupId: number) => {
  return [3427, 3409, 3463, 3454, 924, 3579, 924, 3627].includes(groupId)
}

export const tagsGroupNeeded = (groupId: number) => {
  return [3579].includes(groupId)
}

export const edgeTagsGroups = [
  {
    title: "Weekly Themes",
    tags: [
      "Protocols for Flourishing",
      "Reality Reinvented",
      "Environments of Tomorrow",
      "Emergent Futures",
    ],
  },
  {
    title: "Community",
    tags: [
      "Social Gathering",
      "Workouts",
      "Wellbeing",
      "Food & Beverages",
      "Party",
      "Vibe-coding",
      "Outdoor Adventure",
      "Field Trip",
      "Kids & Families",
    ],
  },
  {
    title: "Topics",
    tags: [
      "AI",
      "Neurotech",
      "Biotech",
      "AR/VR/XR",
      "D/ACC",
      "Hardtech",
      "Blockchain & Cryptography",
      "Privacy",
      "Health & Longevity",
      "Education",
      "Art & Design",
      "Protocol Research",
      "Philosophy",
      "Politics",
      "Climate & Sustainability",
      "Agtech",
      "Governance",
      "Enlightment",
    ],
  },
]

export const eventKinds = [
  {
    label: "Not Set",
    value: null,
  },
  {
    label: "Talk",
    value: "talk",
  },
  {
    label: "Panel",
    value: "panel",
  },
  {
    label: "Workshop",
    value: "workshop",
  },
  {
    label: "Activity",
    value: "activity",
  },

  {
    label: "Seminar",
    value: "seminar",
  },
  {
    label: "Conference",
    value: "conference",
  },

  {
    label: "Meetup",
    value: "meetup",
  },
  {
    label: "Networking",
    value: "networking",
  },

  {
    label: "Training",
    value: "training",
  },
  {
    label: "Exhibition",
    value: "exhibition",
  },

  {
    label: "Other",
    value: "other",
  },
]
