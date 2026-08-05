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
  lastReviewed?: string;
  sections: GuideSection[];
  resourceIds: string[];
  sources?: Array<{ label: string; url: string }>;
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
    slug: "parking-and-bringing-a-car",
    title: "Parking and bringing a car",
    eyebrow: "Eligibility before convenience",
    summary:
      "Match your West Lafayette housing, student level, and travel need to the permit options Purdue currently publishes.",
    readTime: "7 min",
    lastReviewed: "2026-08-05",
    sections: [
      {
        heading: "Start with your student and housing status",
        body: "West Lafayette parking eligibility depends on student level, local academic-year address, housing type, employment, and whether you need overnight storage. Indianapolis uses a separate permit system.",
        checklist: [
          "Identify whether you are first-year, transfer, second-year or above, graduate, or professional.",
          "Confirm whether you live in a residence hall, Hawkins, university-contracted housing, FSCL housing, or off campus.",
          "Decide whether the vehicle must remain overnight or only support commuting.",
          "Open Purdue’s current eligibility boundary map when an address-based permit is involved.",
        ],
      },
      {
        heading: "First-year residence-hall students",
        body: "Purdue states that first-year residence-hall students are not eligible for a normal Residence Hall permit, regardless of earned course credits. A documented off-campus need may support a first-year Value-permit exception.",
        checklist: [
          "Qualifying published needs include off-campus classes other than the airport, reserve or active military duty, and off-campus employment.",
          "Rideshare and joint food-delivery work do not qualify under the published rule.",
          "Recurring off-campus medical appointments are routed through the Disability Resource Center rather than the ordinary exception form.",
          "Exception instructions are in the Parking Portal under Special Permit Requests.",
        ],
      },
      {
        heading: "Compare the current permit types",
        body: "For 2026–27, Purdue lists Value permits at $75, commuter C permits at $100, Residence Hall permits at $150, and eligible professional or graduate garage permits at $250 per year. Availability is limited and the official page controls.",
        checklist: [
          "Value parking is assigned to the airport east gravel lot or 2550 Northwestern Avenue and allows overnight parking outside designated break-storage periods.",
          "C permits depend on the eligibility boundary and are intended for commuters; they often sell out.",
          "Residence Hall permits are for eligible transfer and second-year-or-higher residents and allow overnight parking in posted Residence Hall spaces.",
          "University-contracted housing and FSCL locations may have site-specific rules.",
        ],
      },
      {
        heading: "Apply and use the permit correctly",
        body: "Use the Purdue Parking Portal, upload the required proof, and register the correct license plate. Student permits are enforced through license-plate recognition and students may assign only one vehicle to a permit.",
        checklist: [
          "Check the live request opening date and remaining availability.",
          "Keep the license plate facing the drive lane unless Purdue has issued an approved front plate.",
          "Do not treat hourly or visitor parking as long-term student vehicle storage.",
          "Review break-storage instructions before leaving a car over Thanksgiving, winter, or summer break.",
        ],
      },
    ],
    resourceIds: ["student-parking", "campus-transit", "campus-map", "drc"],
    sources: [
      {
        label: "Purdue Parking Operations — Student Permits",
        url: "https://www.purdue.edu/operations/parking/home/permits/students/",
      },
    ],
    caution:
      "This guide summarizes the West Lafayette 2026–27 page reviewed August 5, 2026. Permit inventory, prices, locations, eligibility, and break-storage rules can change; Purdue Parking Operations and the Parking Portal control.",
  },
  {
    slug: "understanding-financial-aid-offer",
    title: "Understanding your financial-aid offer",
    eyebrow: "Awarded is not the same as estimated",
    summary:
      "Check whether Purdue awarded Pell or other aid, distinguish gift aid from loans, and identify unresolved requirements.",
    readTime: "6 min",
    lastReviewed: "2026-08-05",
    sections: [
      {
        heading: "Use Purdue’s offer for the official answer",
        body: "A FAFSA Submission Summary may show an estimate. Your Purdue aid notification and Aid Offer show what Purdue has actually offered for the selected aid year.",
        checklist: [
          "Log in to myPurdue through Purdue’s official page.",
          "Open the Financial Aid card and choose the correct academic year.",
          "Open the aid notification PDF or the academic-year Aid Offer.",
          "Look for the exact award name and the term-by-term amount.",
        ],
      },
      {
        heading: "Checking for a Federal Pell Grant",
        body: "Look for “Federal Pell Grant” in the Award Offer or Aid Offer details. Pell is a federal grant rather than a scholarship, and Purdue lists it with other gift aid when awarded.",
        checklist: [
          "If Federal Pell Grant appears with an amount, it has been included in Purdue’s offer.",
          "If it is absent, do not infer the reason from a FAFSA estimate alone.",
          "Check Financial Aid Requirements and Messages for missing documents, review, or action items.",
          "Contact the Division of Financial Aid through its official channel for a student-specific explanation.",
        ],
      },
      {
        heading: "Know what requires acceptance",
        body: "Purdue says most grants and scholarships are automatically accepted because they are gift aid. Loans and Federal Work-Study may require an accept, decline, or modify action in myPurdue.",
        checklist: [
          "Do not accept a loan merely because it appears next to gift aid.",
          "Review the amount by term and the conditions attached to each type of aid.",
          "Complete any required loan steps only through official Purdue or StudentAid.gov destinations.",
        ],
      },
      {
        heading: "Separate offered aid from disbursed aid",
        body: "An award can appear before funds are applied to the Purdue invoice. Review requirements, enrollment, and Purdue’s secure-aid instructions, then check the student account for actual application and any resulting refund.",
      },
    ],
    resourceIds: ["financial-aid", "mypurdue", "bursar"],
    sources: [
      {
        label: "Purdue DFA — How to Use myPurdue",
        url: "https://www.purdue.edu/dfa/accept/refund/mypurdue/",
      },
      {
        label: "Purdue DFA — Accepting Aid",
        url: "https://www.purdue.edu/dfa/accept/",
      },
      {
        label: "Purdue DFA — Grants",
        url: "https://www.purdue.edu/dfa/aid/grants/",
      },
    ],
    caution:
      "BoilerCompass cannot determine eligibility or view your account. Aid changes with enrollment, FAFSA data, documentation, satisfactory progress, and federal or university rules. Use myPurdue and Purdue DFA for your binding answer.",
  },
  {
    slug: "laundry-in-university-residences",
    title: "Laundry in University Residences",
    eyebrow: "Know the location and the fee",
    summary:
      "Check whether laundry is paid or included, understand current West Lafayette fees, and set up the correct payment method.",
    readTime: "4 min",
    lastReviewed: "2026-08-05",
    sections: [
      {
        heading: "Identify your housing location",
        body: "Purdue’s West Lafayette laundry page lists traditional halls, Hilltop, and some UR Boiler Apartment locations as paid, while First Street Towers, Aspire, and some other UR Boiler Apartment locations include the fee in the room rate.",
        checklist: [
          "Traditional halls, Hilltop, and some Boiler Apartments use paid machines.",
          "First Street Towers, Aspire, and some Boiler Apartments include laundry in the room rate.",
          "Confirm your assigned location rather than assuming every Purdue residence uses the same fee.",
        ],
      },
      {
        heading: "Budget for a paid load",
        body: "The official page reviewed August 5, 2026 lists $2.50 to wash and $2.00 to dry at paid locations, or $4.50 for one wash-and-dry cycle before detergent. Added dryer time is $0.25.",
      },
      {
        heading: "Set up payment",
        body: "Paid West Lafayette machines accept CSCPay. The app can add funds, show machine status, and send cycle notifications.",
        checklist: [
          "Install and fund CSCPay before the first load if your location charges.",
          "Students without a smartphone can ask the Hawkins Hall or Frieda Parker Hall main office about Purdue’s published alternative-payment option.",
          "Use high-efficiency detergent appropriate for the front-load machines.",
        ],
      },
      {
        heading: "Handle unused funds",
        body: "University Residences publishes a CSCPay refund procedure and notes that returning students’ funds remain available. Follow the current app and housing instructions because processing dates may change.",
      },
    ],
    resourceIds: ["residence-laundry", "housing"],
    sources: [
      {
        label: "University Residences — Laundry Options",
        url: "https://www.housing.purdue.edu/my-housing/info/amenities-accommodations/laundry.html",
      },
    ],
    caution:
      "These details apply to the current official West Lafayette University Residences page, not every Purdue location or private apartment. Recheck the source after a housing assignment or price change.",
  },
  {
    slug: "new-student-essentials",
    title: "New student essentials",
    eyebrow: "Know the first doors",
    summary:
      "A compact orientation to the portals, campus map, support offices, and everyday services you are most likely to need first.",
    readTime: "9 min",
    lastReviewed: "2026-08-05",
    sections: [
      {
        heading: "Before arrival: secure your Purdue access",
        body: "Activate your Purdue Career Account, set up Microsoft Authenticator MFA, sign in to Purdue email, and bookmark official login pages rather than search-result ads.",
        checklist: [
          "Activate the Career Account using Purdue’s official new-student instructions.",
          "Set up Microsoft MFA using Purdue IT’s current instructions.",
          "Sign in to Purdue email and check it regularly for official notices.",
          "Learn myPurdue, Brightspace, BoilerConnect, and the Purdue Catalog.",
          "Set up Purdue Mobile ID and know where Card Operations support lives.",
        ],
      },
      {
        heading: "Before move-in: finish money and housing tasks",
        body: "Review the correct financial-aid year, Purdue invoice, housing assignment, move-in instructions, and the services tied to your specific residence.",
        checklist: [
          "Check the Aid Offer, Financial Aid Requirements, and Messages in myPurdue.",
          "Review the Purdue invoice and set up direct deposit or an authorized user if needed.",
          "Confirm the assigned residence, move-in date, unloading instructions, and what-to-bring guidance.",
          "Check the exact mailing address and package-pickup procedure for the assigned residence.",
          "Determine whether laundry is paid or included and install CSCPay if required.",
        ],
      },
      {
        heading: "First week: learn the daily systems",
        body: "Walk your schedule, learn campus transportation, confirm course access, and understand the everyday services you will use.",
        checklist: [
          "Locate every classroom before the first meeting and use the correct campus map.",
          "Confirm that each expected course appears in Brightspace and review its syllabus.",
          "Check current transit information and do not assume old routes or fares still apply.",
          "Understand the difference between Mobile ID access, meal-plan use, and BoilerExpress.",
          "If bringing a car, verify eligibility and purchase only the permit Purdue authorizes for your situation.",
        ],
      },
      {
        heading: "First month: protect deadlines and know support",
        body: "Open the official academic and add/drop calendars, then save the support routes you may need before a problem becomes urgent.",
        checklist: [
          "Confirm the campus, term, and course length before using an add/drop or refund deadline.",
          "Know how to contact your instructor, advisor, tutoring resources, and the Academic Success Center.",
          "Save ODOS, PUSH, CAPS, accessibility support, and emergency information.",
          "For an immediate emergency call 911; BoilerCompass is not an emergency service.",
        ],
      },
    ],
    resourceIds: [
      "mypurdue",
      "brightspace",
      "boilerconnect",
      "campus-map",
      "purdue-it-new-students",
      "mobile-id-card",
      "academic-calendars",
      "student-parking",
      "residence-laundry",
      "residence-mail-packages",
      "bgr",
      "odos",
    ],
    sources: [
      {
        label: "Purdue DFA — How to Use myPurdue",
        url: "https://www.purdue.edu/dfa/accept/refund/mypurdue/",
      },
      {
        label: "Purdue IT — New to Purdue",
        url: "https://it.purdue.edu/services/new-to-purdue.php",
      },
      {
        label: "Purdue ID Card Operations",
        url: "https://www.purdue.edu/treasurer/finance/card/",
      },
      {
        label: "Office of the Registrar — Calendars",
        url: "https://www.purdue.edu/registrar/calendars/",
      },
      {
        label: "University Residences — Postal Service & Shipping",
        url: "https://www.housing.purdue.edu/my-housing/info/general/postal-service.html",
      },
      {
        label: "Purdue Parking Operations — Student Permits",
        url: "https://www.purdue.edu/operations/parking/home/permits/students/",
      },
      {
        label: "University Residences — Laundry Options",
        url: "https://www.housing.purdue.edu/my-housing/info/amenities-accommodations/laundry.html",
      },
    ],
    caution:
      "Campus services differ. If a card says “Verify campus applicability,” confirm the correct Indianapolis, West Lafayette, online, or statewide office.",
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
