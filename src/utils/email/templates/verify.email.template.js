export const verifyEmailTemplate = ({otp , title="Email Confirmation"}={})=>{
    return   `<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    />
  </head>
  <style type="text/css">
    body {
      background-color: #88bdbf;
      margin: 0px;
    }
  </style>
  <body style="margin: 0px">
    <table
      border="0"
      width="50%"
      style="
        margin: auto;
        padding: 30px;
        background-color: #f3f3f3;
        border: 1px solid #b44974ff;
      "
    >
      <tr>
        <td>
          <table border="0" width="100%"></table>
        </td>
      </tr>
      <tr>
        <td>
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            style="text-align: center; width: 100%; background-color: #fff"
          >
            <tr>
              <td
                style="
                  background-color: #b44974ff;
                  height: 40px;
                  font-size: 50px;
                  color: #faf7f3;
                "
              >
                <p>👋🏻</p>
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="padding-top: 25px; color: #b44974ff">${title}</h1>
              </td>
            </tr>
            <tr>
              <td>
                <p style="padding: 0px 100px"></p>
              </td>
            </tr>
            <tr>
              <td>
                <h2
                  style="
                    margin: 10px 0px 30px 0px;
                    border-radius: 4px;
                    padding: 10px 20px;
                    border: 0;
                    color: #faf7f3;
                    background-color: #b44974ff;
                  "
                >
                  ${otp}
                </h2>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table
            border="0"
            width="100%"
            style="border-radius: 5px; text-align: center"
          >
            <tr>
              <td>
                <h3 style="margin-top: 10px; color: #521c0d">Stay in touch</h3>
              </td>
            </tr>
            <tr>
              <td>
                <div style="margin-top: 20px">
                  <a
                    href="${process.env.facebookLink}"
                    style="text-decoration: none"
                    ><span
                      class="twit"
                      style="padding: 10px 9px; color: #fff; border-radius: 50%"
                    >
                      <img
                        src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                        width="50px"
                        hight="50px" /></span
                  ></a>

                  <a
                    href="${process.env.instegram}"
                    style="text-decoration: none"
                    ><span
                      class="twit"
                      style="padding: 10px 9px; color: #fff; border-radius: 50%"
                    >
                      <img
                        src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                        width="50px"
                        hight="50px"
                    /></span>
                  </a>

                  <a
                    href="${process.env.twitterLink}"
                    style="text-decoration: none"
                    ><span
                      class="twit"
                      style="padding: 10px 9px; color: #fff; border-radius: 50%"
                    >
                      <img
                        src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                        width="50px"
                        hight="50px"
                    /></span>
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

        `
}