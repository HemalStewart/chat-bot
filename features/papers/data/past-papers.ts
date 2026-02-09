import type { PastPaper, PastPaperQuestion, MarkingScheme } from "@/features/papers/types";

export const pastPapers: PastPaper[] = [
  {
    id: "al-physics-2023-p1",
    year: 2023,
    subject: "A/L Physics",
    title: "Paper 1 Structured",
    source: "Sample dataset",
  },
  {
    id: "al-physics-2022-p2",
    year: 2022,
    subject: "A/L Physics",
    title: "Paper 2 Essay",
    source: "Sample dataset",
  },
  {
    id: "al-physics-2021-p1",
    year: 2021,
    subject: "A/L Physics",
    title: "Paper 1 Structured",
    source: "Sample dataset",
  },
];

export const pastPaperQuestions: PastPaperQuestion[] = [
  {
    id: "q-2023-1",
    paperId: "al-physics-2023-p1",
    number: "01",
    prompt:
      "A ball is projected vertically upward with speed 18 m s⁻¹. Calculate the maximum height reached and the time to return to the launch point.",
    topics: ["Kinematics", "Gravity"],
  },
  {
    id: "q-2023-2",
    paperId: "al-physics-2023-p1",
    number: "02",
    prompt:
      "A 4 Ω resistor and a 6 Ω resistor are connected in parallel to a 12 V source. Find the total current and power dissipated.",
    topics: ["Electricity", "Circuits"],
  },
  {
    id: "q-2023-3",
    paperId: "al-physics-2023-p1",
    number: "03",
    prompt:
      "An object of mass 2 kg is pulled across a rough surface with a 10 N force at 30° to the horizontal. Determine the acceleration.",
    topics: ["Forces", "Work and Energy"],
  },
  {
    id: "q-2022-1",
    paperId: "al-physics-2022-p2",
    number: "01",
    prompt:
      "Explain how Young's double-slit experiment demonstrates the wave nature of light. Include conditions for constructive interference.",
    topics: ["Waves", "Optics"],
  },
  {
    id: "q-2022-2",
    paperId: "al-physics-2022-p2",
    number: "02",
    prompt:
      "Describe the energy transformations in a transformer and derive the relationship between primary and secondary voltages.",
    topics: ["Electromagnetism"],
  },
  {
    id: "q-2022-3",
    paperId: "al-physics-2022-p2",
    number: "03",
    prompt:
      "A satellite moves in a circular orbit of radius 7.0 × 10⁶ m. Determine its orbital speed and period.",
    topics: ["Gravitation", "Circular Motion"],
  },
  {
    id: "q-2021-1",
    paperId: "al-physics-2021-p1",
    number: "01",
    prompt:
      "Two waves of the same frequency travel in opposite directions and form a standing wave. Explain the positions of nodes and antinodes.",
    topics: ["Waves"],
  },
  {
    id: "q-2021-2",
    paperId: "al-physics-2021-p1",
    number: "02",
    prompt:
      "A capacitor of 5 μF is charged to 12 V and then disconnected. Calculate the stored energy and charge.",
    topics: ["Electrostatics", "Capacitance"],
  },
  {
    id: "q-2021-3",
    paperId: "al-physics-2021-p1",
    number: "03",
    prompt:
      "A 1.5 kg block slides down a frictionless incline of height 2.0 m. Find the speed at the bottom.",
    topics: ["Energy"],
  },
];

export const markingSchemes: MarkingScheme[] = [
  {
    id: "ms-2023-1",
    questionId: "q-2023-1",
    scheme:
      "Standing waves form from two waves of equal frequency traveling in opposite directions. Nodes are points of zero displacement (destructive interference) spaced λ/2 apart. Antinodes are points of maximum displacement between nodes, also spaced λ/2 apart with node–antinode distance λ/4.",
    marks: 6,
  },
  {
    id: "ms-2023-2",
    questionId: "q-2023-2",
    scheme:
      "Equivalent resistance: 1/Rt = 1/4 + 1/6 = 5/12 → Rt = 2.4 Ω. Current It = 12/2.4 = 5 A. Power P = VI = 12 × 5 = 60 W.",
    marks: 5,
  },
  {
    id: "ms-2023-3",
    questionId: "q-2023-3",
    scheme:
      "Resolve force horizontally: 10 cos30° = 8.66 N. Acceleration a = F/m = 8.66 / 2 = 4.33 m s⁻².",
    marks: 5,
  },
  {
    id: "ms-2022-1",
    questionId: "q-2022-1",
    scheme:
      "Explain coherent sources, path difference and constructive interference: Δ = mλ. Mention fringe spacing and interference pattern.",
    marks: 8,
  },
  {
    id: "ms-2022-2",
    questionId: "q-2022-2",
    scheme:
      "Describe flux linkage and energy transfer. Using Faraday's law, derive Vs/Vp = Ns/Np and mention efficiency assumptions.",
    marks: 9,
  },
  {
    id: "ms-2022-3",
    questionId: "q-2022-3",
    scheme:
      "Orbital speed v = √(GM/r). Period T = 2πr/v. Substitute r (7.0×10⁶ m) and g (or GM) for numerical estimate.",
    marks: 7,
  },
  {
    id: "ms-2021-1",
    questionId: "q-2021-1",
    scheme:
      "Nodes are points of zero displacement; antinodes are points of maximum displacement. Node spacing = λ/2; node–antinode spacing = λ/4.",
    marks: 4,
  },
  {
    id: "ms-2021-2",
    questionId: "q-2021-2",
    scheme:
      "Charge Q = CV = 60 μC. Energy = 1/2 CV² = 3.6 × 10⁻4 J.",
    marks: 5,
  },
  {
    id: "ms-2021-3",
    questionId: "q-2021-3",
    scheme:
      "Use mgh = 1/2 mv² → v = √(2gh) ≈ 6.3 m s⁻¹.",
    marks: 4,
  },
];
