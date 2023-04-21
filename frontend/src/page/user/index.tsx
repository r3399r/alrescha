import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'src/component/Button';
import Divider from 'src/component/Divider';
import Input from 'src/component/Input';
import Modal from 'src/component/Modal';
import Body from 'src/component/typography/Body';
import H3 from 'src/component/typography/H3';
import { GetUserResponse } from 'src/model/Api';
import { addQuotaToUser, getUserList } from 'src/service/userService';

const User = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>();
  const [userList, setUserList] = useState<GetUserResponse>();
  const [input, setInput] = useState<string>('');
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    getUserList().then((res) => setUserList(res));
  }, []);

  const onSubmit = () => {
    if (input.length === 0 || code.length === 0 || selected === undefined) return;
    addQuotaToUser(selected, Number(input), code).then((res) => {
      setUserList(
        userList?.map((v) =>
          v.id !== selected
            ? v
            : {
                ...v,
                quota: res.quota,
              },
        ),
      );
      setSelected(undefined);
      setInput('');
      setCode('');
    });
  };

  return (
    <div className="mt-10 xl:mt-[60px] max-w-[1120px] mx-auto">
      <div className="mx-[15px]">
        <H3 className="mb-5">用戶列表</H3>
        <div className="hidden lg:flex">
          <div className="w-[50px]" />
          <div className="flex w-full">
            <Body className="w-1/3 px-[10px] py-[15px]">用戶名稱</Body>
            <Body className="w-1/3 px-[10px] py-[15px]">剩餘額度</Body>
            <Body className="w-1/3 px-[10px] py-[15px] text-right">管理額度</Body>
          </div>
        </div>
        <Divider className="lg:!bg-black" />
        {userList &&
          userList.map((v) => (
            <div key={v.id}>
              <div className="flex items-center py-[15px]">
                {v.pictureUrl ? (
                  <img src={v.pictureUrl} className="w-[50px] rounded-full" />
                ) : (
                  <div className="w-[50px] bg-grey-500 rounded-full" />
                )}
                <div className="flex gap-1 w-full items-center">
                  <div className="flex items-center w-full lg:w-2/3 flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 px-[10px]">
                      <Body
                        className="text-grey-600 break-all"
                        onClick={() => navigate(`/preview?id=${v.id}`)}
                      >
                        {v.id}
                      </Body>
                      <Body size="l">{v.name}</Body>
                    </div>
                    <Body className="w-full lg:w-1/2 px-[10px] text-blue font-bold">
                      {v.quota} 秒
                    </Body>
                  </div>
                  <div className="w-fit lg:w-1/3 text-right pr-[10px]">
                    <Button onClick={() => setSelected(v.id)}>管理</Button>
                  </div>
                </div>
              </div>
              <Divider />
            </div>
          ))}
      </div>
      <Modal open={selected !== undefined} handleClose={() => setSelected(undefined)}>
        <>
          <H3>新增秒數</H3>
          <div className="my-[15px] relative">
            <Input
              className="w-full"
              inputMode="numeric"
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Body className="text-grey-600 absolute right-[10px] bottom-[10px]">秒</Body>
          </div>
          <Input
            className="w-full mb-[30px]"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex gap-5">
            <Button className="w-full" onClick={() => setSelected(undefined)}>
              取消
            </Button>
            <Button className="w-full" appearance="secondary" onClick={onSubmit}>
              送出
            </Button>
          </div>
        </>
      </Modal>
    </div>
  );
};

export default User;
