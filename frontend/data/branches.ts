export interface Branch {
  id: string;
  name: string;
  bio: string;
  image: string;
  location: string;
 
}

export const branches: Branch[] = [
  {
    id: "B1",
    name: "SmartCare Colombo",
    bio: "Modern healthcare with trusted doctors.",
    image: "/B1.jpeg",
    location: "Colombo 03",
  },
  {
    id: "B2",
    name: "SmartCare Kandy",
    bio: "Accessible healthcare with expert support.",
    image: "/B2.jpg",
     location: "Kandy 01",
  },
  {
    id: "B3",
    name: "SmartCare Galle",
    bio: "Reliable medical care for every patient.",
    image: "/B3.jpg",
    location: "Galle 07",
  },
];
