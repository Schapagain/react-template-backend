"use strict";

const testImages = [
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846649/react-template-project/parker_tbai0f.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239309/react-template-project/parker-placeholder_xeiguk.jpg",
    height: 3024,
    width: 4032,
    user_id: 1,
  },
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846644/react-template-project/niagara_tatmhh.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239438/react-template-project/niagara-placeholder_ioq0ux.jpg",
    height: 945,
    width: 1260,
    user_id: 1,
  },
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846645/react-template-project/case_in_snow_vvfulr.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239310/react-template-project/case_in_snow-placeholder_mzdade.jpg",
    height: 3024,
    width: 4032,
    user_id: 1,
  },

  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846647/react-template-project/bike_wntdvh.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239310/react-template-project/bike-placeholder_dstr8w.jpg",
    height: 4032,
    width: 3024,
    user_id: 1,
  },
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846648/react-template-project/IMG_0899_zvr6t5.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239513/react-template-project/IMG_0899-placeholder_wozolb.jpg",
    height: 3024,
    width: 4032,
    user_id: 1,
  },
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846651/react-template-project/morning_mist_jbj4yj.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239309/react-template-project/morning_mist-placeholder_lkvf3p.jpg",

    height: 4032,
    width: 3024,
    user_id: 1,
  },
  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846639/react-template-project/canal_trail_nqqlns.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239309/react-template-project/canal_trail-placeholder_bvfuvz.jpg",
    height: 945,
    width: 1260,
    user_id: 1,
  },

  {
    src: "https://res.cloudinary.com/skyimages/image/upload/v1620846338/react-template-project/the_big_picture_tdacku.jpg",
    placeholder:
      "https://res.cloudinary.com/skyimages/image/upload/v1621239563/react-template-project/the_big_picture-placeholder_ax6ckf.jpg",
    height: 4032,
    width: 3024,
    user_id: 1,
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "images",
      testImages.map((image) => ({
        ...image,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },
};
