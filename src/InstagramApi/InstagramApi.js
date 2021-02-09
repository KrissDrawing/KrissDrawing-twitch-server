import userInstagram from "user-instagram";

export const getInstagramLink = async () => {
  let data;
  try {
    data = await userInstagram("krissdrawing");
    return data.posts[0].imageUrl;
  } catch (err) {
    console.error(err);
    return "https://scontent-frt3-1.cdninstagram.com/v/t51.2885-15/e35/143054419_6508381919243455_2106699446992348474_n.jpg?_nc_ht=scontent-frt3-1.cdninstagram.com&_nc_cat=107&_nc_ohc=3cwELZR18rQAX9ssuXP&tp=1&oh=09446524a52c6f35ac0297e68011d701&oe=604302BE";
  }
};
