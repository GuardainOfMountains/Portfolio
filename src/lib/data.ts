export interface Project {
  title: string;
  problem: string;
  solution: string;
  tech: string[];
  link?: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  problem: string;
  solution: string;
  tech: string[];
}

export const PROFILE = {
  name: "Montana Howard",
  title: "Systems Engineer / Infrastructure Developer",
  email: "montanallahoward@gmail.com",
  philosophy: {
    core: "Optimization. Automation. UX.",
    narrative: "I don't just fix servers; I remove friction. If I do it twice, I script it. If it lags, I trace it. I build internal tooling that makes systems fast and low-friction for everyone.",
  },
  experience: [
    {
      role: "PC Deployment",
      company: "Allegheny General Hospital",
      period: "Previous",
      problem: " Over 4000 thin client's scatterd in high-pressure environment's or left unplugged, tasked with replaceing devices that have reached EOL without interfering with hospital workflow.",
      solution: "Bridged the clinical-IT gap by configuring and deploying resilient thin client solutions. Troubleshot directly in the field to ensure compliance and reduce friction for medical staff.",
      tech: ["Thin Clients", "ssh/PUTTy", "Microsoft Excel", "Microsoft Word", "RDP", "Outlook"],
    },
  ] as Experience[],
  projects: [
    {
      title: "Network-Wide Ad Blocking",
      problem: "Ads and trackers were consuming bandwidth, increasing latency, and violating user privacy across the home network.",
      solution: "Deployed Pi-hole as a DNS sinkhole to block unwanted traffic at the network level, optimizing speed and enhancing security for all devices.",
      tech: ["Pi-hole", "DNS", "Networking"],
    },
    {
      title: "Private Search Infrastructure",
      problem: "Major search engines trap users in filter bubbles and track every query.",
      solution: "Self-hosted SearXNG to aggregate results from multiple engines while stripping tracking data, ensuring unbiased and private information access.",
      tech: ["SearXNG", "Privacy", "Self-hosting"],
    },
    {
      title: "Local AI Inference",
      problem: "Public AI APIs are costly, have high latency, and pose privacy risks for sensitive queries.",
      solution: "Built a self-hosted LLM infrastructure for unmetered, private, and low-latency AI assistance completely offline.",
      tech: ["LLM", "Local Inference", "Python", "Hardware Acceleration"],
    },
    {
      title: "Media Streaming Server",
      problem: "Reliance on fragmented streaming services with recurring costs and limited library control.",
      solution: "Architected a Jellyfin media server to centralize content, providing high-speed local streaming without buffering or subscriptions.",
      tech: ["Jellyfin", "Media Encoding", "Storage Management"],
    },
    {
      title: "VOIP System Planning",
      problem: "Standard communication tools lacked flexibility and reliability for specific use cases.",
      solution: "Planned and customized a VOIP deployment to ensure reliable, high-quality voice communication on own terms.",
      tech: ["VOIP", "SIP", "Network QoS"],
    },
    {
      title: "Gamified Linux Education",
      problem: "Learning Linux command line tools via textbooks is dry and inefficient.",
      solution: "Developed a custom Linux terminal game that teaches commands through interactive gameplay, boosting retention and engagement.",
      tech: ["Bash/Shell", "Linux", "Gamification", "Education"],
    },
  ] as Project[],
  skills: [
    "Linux System Administration",
    "Bash/Shell Scripting",
    "Network & Infrastructure",
    "Infrastructure Automation",
    "Self-Hosting / Homelab",
    "Web Development",
    "Troubleshooting & Debugging",
  ],
};
