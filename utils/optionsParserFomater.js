export const cookieOptions = (age) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: age,
  };
};

export const cookieParser = (cookies) => {
  const map = new Map();
  cookies &&
    cookies.split(";").forEach((val) => {
      const [key, value] = val.trim().split("=");
      map.set(key, value);
    });
  return map;
};

// export const aproxTimeAgo = (time) => {
//   const diff = new Date() - new Date(time);
//   const minutes = Math.floor(diff / (1000 * 60));
//   const hours = Math.floor(diff / (1000 * 60 * 60));
//   const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//   if (minutes < 1) return "Just now";
//   if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
//   if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//   return `${days} day${days > 1 ? "s" : ""} ago`;
// };
