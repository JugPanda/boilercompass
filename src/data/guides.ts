export type GuideSection = {
  heading: string;
  body: string;
  checklist?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  readTime: string;
  sections: GuideSection[];
  resourceIds: string[];
  caution: string;
};

export const guides: Guide[] = [
  {
    slug: "advisor-meeting-prep",
    title: "Prepare for an advisor meeting",
    eyebrow: "A better 30 minutes",
    summary:
      "Turn a vague check-in into a focused conversation about your plan, questions, and next decisions.",
    readTime: "5 min",
    sections: [
      {
        heading: "Before the meeting",
        body: "Review your current degree plan and write down the decisions you actually need help making.",
        checklist: [
          "Bring specific questions, not only a general request to review your plan.",
          "Note the requirements you believe remain and where you found them.",
          "List new interests, concerns, or possible changes early.",
          "Bring backup courses in case your first registration choices are unavailable.",
        ],
      },
      {
        heading: "Questions worth asking",
        body: "Ask your advisor to explain the reasoning, not just the next course number.",
        checklist: [
          "What does the overall path to graduation look like from here?",
          "Which prerequisites apply now, and has anything changed for my catalog year?",
          "Does this proposed substitution actually count toward the requirement I mean?",
          "What should I do if a requested course is full?",
          "Who else should I contact if this decision crosses colleges, campuses, or programs?",
        ],
      },
      {
        heading: "Close the loop",
        body: "Before leaving, restate the next steps in your own words and note who owns each action. Follow up through the official channel when documentation is needed.",
      },
    ],
    resourceIds: ["boilerconnect", "catalog", "registrar", "mypurdue"],
    caution:
      "BoilerCompass helps you prepare; it is not an official degree audit and does not replace your academic advisor.",
  },
  {
    slug: "changing-a-major",
    title: "Changing a major (CODO)",
    eyebrow: "Start with current requirements",
    summary:
      "A careful starting path for exploring a Change of Degree Objective without freezing changeable program rules into a checklist.",
    readTime: "6 min",
    sections: [
      {
        heading: "Know the term",
        body: "CODO means Change of Degree Objective. At Purdue it is the process used for changing a major or degree objective; it does not automatically describe every minor, certificate, dual-degree, or multiple-major situation.",
      },
      {
        heading: "Research before deciding",
        body: "Open the current official CODO requirements for the program you are considering.",
        checklist: [
          "Compare required courses and minimum criteria.",
          "Check whether the program has capacity limits or timing rules.",
          "Review how completed coursework may apply.",
          "Write down cost, time-to-degree, or location questions rather than assuming the answer.",
        ],
      },
      {
        heading: "Talk with your current advisor",
        body: "Your current advisor can help identify effects on your present plan and route you to the receiving program. Ask which office must confirm the final answer.",
      },
    ],
    resourceIds: ["codo", "catalog", "boilerconnect"],
    caution:
      "CODO requirements, eligibility, capacity, and deadlines can change. The official page and Purdue advisors control—not this guide.",
  },
  {
    slug: "changing-location",
    title: "Changing Purdue location",
    eyebrow: "Campus scope matters",
    summary:
      "Use Purdue’s official Location Change process and verify that your intended program is offered at the destination you want.",
    readTime: "5 min",
    sections: [
      {
        heading: "Use official wording",
        body: "Purdue calls this process Location Change. You may hear informal references to CODO/COLO, but the official page is the source to follow.",
      },
      {
        heading: "Check the full impact",
        body: "A location change can affect program availability, course sequencing, housing, aid, and support offices.",
        checklist: [
          "Confirm the intended program exists at the destination.",
          "Ask which credits and requirements carry into the new plan.",
          "Verify current deadlines and eligibility.",
          "Discuss housing, aid, transportation, and orientation separately when relevant.",
        ],
      },
      {
        heading: "Get written next steps",
        body: "Ask your current advisor which office handles the request and where the current form or workflow lives. Save official confirmations.",
      },
    ],
    resourceIds: ["location-change", "catalog", "financial-aid", "housing"],
    caution:
      "Do not rely on an old checklist or an informal expansion of “COLO.” Purdue’s current Location Change page and advisors are authoritative.",
  },
  {
    slug: "degree-plus-dual-degrees",
    title: "Exploring dual degrees and Degree Plus",
    eyebrow: "Map the whole plan",
    summary:
      "Separate the attractive headline from the actual sequencing, eligibility, time, and cost of your individual degree combination.",
    readTime: "6 min",
    sections: [
      {
        heading: "Understand Degree Plus",
        body: "Purdue describes Degree Plus as a streamlined four-year dual-degree path combining a College of Liberal Arts degree with a degree in another school or college.",
      },
      {
        heading: "Test the plan",
        body: "A four-year path is not an automatic promise for every student or combination.",
        checklist: [
          "Ask both academic units to confirm the degree combination.",
          "Map prerequisite chains and courses offered only in certain terms.",
          "Check whether credits satisfy both plans or only one.",
          "Confirm likely time and financial impact for your exact situation.",
        ],
      },
      {
        heading: "Compare alternatives",
        body: "A minor, certificate, concentration, or elective plan may serve the same goal with different tradeoffs. Ask advisors to compare outcomes rather than only labels.",
      },
    ],
    resourceIds: [
      "degree-plus",
      "science-dual-program",
      "catalog",
      "financial-aid",
    ],
    caution:
      "BoilerCompass does not promise no additional time or cost. Confirm your individual plan with Purdue and the relevant advisors.",
  },
  {
    slug: "course-planning-registration",
    title: "Course planning and registration",
    eyebrow: "Explore, then verify",
    summary:
      "Use independent tools for discovery while keeping official Purdue systems in charge of prerequisites, availability, and degree progress.",
    readTime: "7 min",
    sections: [
      {
        heading: "Build from official requirements",
        body: "Start with your applicable catalog, current degree audit, and advisor guidance. Treat old plans and screenshots as reference—not policy.",
      },
      {
        heading: "Explore options",
        body: "Course Insights and independent course tools can help you compare possibilities and form better questions.",
        checklist: [
          "Check prerequisites and restrictions in current official sources.",
          "Confirm the course is offered in the intended term and campus.",
          "Keep one or two backup sections or courses.",
          "Use historical grades and reviews as context, never a guarantee.",
        ],
      },
      {
        heading: "Register in Purdue systems",
        body: "Complete registration only through current Purdue systems. Re-check your schedule after changes and resolve holds or errors through the responsible Purdue office.",
      },
    ],
    resourceIds: [
      "mypurdue",
      "catalog",
      "registrar",
      "course-insights",
      "boilerclasses",
    ],
    caution:
      "Course tools and historical data do not override official prerequisites, schedules, policies, or advisor guidance.",
  },
  {
    slug: "getting-academic-help",
    title: "Getting academic help",
    eyebrow: "Ask before the problem compounds",
    summary:
      "A quick route from “I am stuck” to the right instructor, help room, tutoring option, or academic-support service.",
    readTime: "4 min",
    sections: [
      {
        heading: "Start close to the course",
        body: "Check the syllabus and Brightspace, then contact the instructor or course staff using the stated channel. Bring a specific attempt or question.",
      },
      {
        heading: "Add structured support",
        body: "Search the tutoring directory and Supplemental Instruction schedule. The Academic Success Center can also help with planning, habits, and study strategy.",
      },
      {
        heading: "Address access barriers",
        body: "If disability or accessibility needs affect participation, contact the appropriate Purdue accessibility office early rather than waiting for a crisis.",
      },
    ],
    resourceIds: [
      "brightspace",
      "tutoring-directory",
      "supplemental-instruction",
      "academic-success",
      "drc",
    ],
    caution:
      "Offerings and schedules change by term and campus. Verify the current service before traveling or relying on availability.",
  },
  {
    slug: "new-student-essentials",
    title: "New student essentials",
    eyebrow: "Know the first doors",
    summary:
      "A compact orientation to the portals, campus map, support offices, and everyday services you are most likely to need first.",
    readTime: "5 min",
    sections: [
      {
        heading: "Set up your academic basics",
        body: "Learn myPurdue, Brightspace, BoilerConnect, and the Purdue Catalog. Bookmark the official pages rather than search-result login ads.",
      },
      {
        heading: "Learn your campus",
        body: "Use the correct campus map and current transit information. Check dining, housing, and orientation pages for term-specific updates.",
      },
      {
        heading: "Save support before you need it",
        body: "Know where ODOS, health services, counseling, accessibility support, and emergency information live. For an immediate emergency, call 911.",
      },
    ],
    resourceIds: [
      "mypurdue",
      "brightspace",
      "boilerconnect",
      "campus-map",
      "bgr",
      "odos",
    ],
    caution:
      "Campus services differ. If a card says “Verify campus applicability,” confirm the correct Indianapolis, West Lafayette, online, or statewide office.",
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
