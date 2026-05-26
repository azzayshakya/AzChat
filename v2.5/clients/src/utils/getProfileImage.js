export function getProfileImage(contact) {
  if (
    contact.id === "653c1ea1-acb8-46b3-918e-8416c8936584" ||
    contact.id === "b3c5ec70-ec6b-4895-8c1a-d137a60ecc9d"
  ) {
    return "/default_female_profile_pic.jpg";
  }

  if (contact.role === "admin") {
    return "/developer_profile.jpg";
  }

  return "/default_male_profile_pic.jpg";
}
