interface OptionOTP {
  value: any;
  action: any;
  active: Boolean;
  email: any;
  sms: any;
}

const OptionOTP = (props: OptionOTP) => {
  return (
    <>
      <div className="mb-4 ">
        <h3 className="text-xl border-b-2">Thay Đổi hình thức nhận OTP</h3>

        <div className="mt-4 flex items-center justify-center mr-14">
          <div className="w-1/3 mt-6">
            {!props.active && (
              <select
                id="selectOption"
                name="selectOption"
                value={props.value}
                onChange={props.action}
                className="rounded w-21"
              >
                <option value="" disabled>
                  -- Chọn --
                </option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="card">Card</option>
              </select>
            )}
            {props.active && (
              <select
                id="selectOption"
                name="selectOption"
                value={props.value}
                onChange={props.action}
                className="rounded w-21"
                disabled
              >
                <option value="" disabled>
                  -- Chọn --
                </option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="card">Card</option>
              </select>
            )}
          </div>
        </div>
        <div className="text-sm ">
          {props.value === 'email' && (
            <div className=" mt-5">
              <p>Mã OTP của bạn được gửi về</p>
              <p>{props.email}</p>
            </div>
          )}

          {props.value === 'sms' && (
            <div className=" mt-5">
              <p>Mã OTP của bạn được gửi về</p>
              <p>số điện thoại : {props.sms}</p>
            </div>
          )}
          {props.value === 'card' && (
            <div className=" mt-5">
              <p>Mã OTP sẽ được chọn ngẫu nhiên từ 1 đến 35</p>
              <p>tương ứng với các dãy số trên thẻ của bạn</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default OptionOTP;
