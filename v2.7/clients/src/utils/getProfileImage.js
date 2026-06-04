export function getProfileImage(contact) {
  if (contact.id === "b3c5ec70-ec6b-4895-8c1a-d137a60ecc9d") {
    return "/femaleProfilePic3.jpg";
  }
  if (contact.id === "653c1ea1-acb8-46b3-918e-8416c8936584") {
    return "/default_female_profile_pic.jpg";
  }
  if (contact.id === "3f761a1d-112d-404f-be08-2351c1e08596") {
    return "/maleProfilePic5.png";
  }
  if (contact.id === "71057af1-9259-42be-b8fb-01272fc32c81") {
    return "/maleProfilePic5.png";
  }
  if (contact.id === "17ef5765-aa08-492e-aaa0-215498b5b60a") {
    return "/maleProfilePic4.jpg";
  }

  if (contact.role === "admin") {
    return "/developer_profile.jpg";
  }

  return "/default_male_profile_pic.jpg";
}
