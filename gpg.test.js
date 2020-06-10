const { parseKeys } = require("./gpg");
const MockDate = require("mockdate");

describe("parseKeys", () => {
  it("determines accurate status", () => {
    MockDate.set("2020-06-10");
    const gpgOutput = `/Users/jcarberr/repo/.blackbox/pubring.kbx
--------------------------------------------------
pub   rsa4096 2017-10-19 [SC] [expired: 2019-10-19]
      A25FA7800E970314489E851C35D4692812352952
uid           [ expired] Josiah Carberry <josiah_carberry@brown.edu>

pub   rsa2048 2018-11-05 [SC] [expires: 2020-11-04]
      538E5B87A897F449C8B9E56D6A145EB8F76715CD
uid           [ unknown] Laura Carberry <laura_carberry@brown.edu>
sub   rsa2048 2018-11-05 [E] [expires: 2020-11-04]

pub   rsa2048 2018-02-06 [SC] [expires: 2020-06-14]
      3C00A27F095896C990C5377E8DCB9594891EAE25
uid           [ expired] Lois Carberry <lois_carberry@brown.edu>`;
    expect(parseKeys(gpgOutput)).toEqual([
      { email: "josiah_carberry@brown.edu", status: "expired" },
      { email: "laura_carberry@brown.edu", status: "valid" },
      { email: "lois_carberry@brown.edu", status: "expiring" },
    ]);
  });
});
