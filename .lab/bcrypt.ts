import bcrypt from "bcryptjs";

const main = async () => {
  const pw1 = "password";
  const pw2 = "password"; // 同じパスワード

  // パスワードからハッシュを生成 （コストファクターは10）
  const hash1 = await bcrypt.hash(pw1, 10);
  const hash2 = await bcrypt.hash(pw2, 10);

  // ハッシュを表示 (同じパスワードでもソルトが異なるため、ハッシュは異なる)
  console.log(`hash1 ${hash1}`);
  console.log(`hash2 ${hash2}`);

  // bcrypt.compare(...) によるパスワードの検証 (パスワードとハッシュを比較)
  // 第1引数が「パスワード」、第2引数が「ハッシュ値」
  // 同じパスワードであれば true、異なるパスワードであれば false
  const isPasswordValid1 = await bcrypt.compare("password", hash1);
  const isPasswordValid2 = await bcrypt.compare("password", hash2);
  const isPasswordValid3 = await bcrypt.compare("hoge!hoge!", hash1);

  console.log("isPasswordValid1 => ", isPasswordValid1);
  console.log("isPasswordValid2 => ", isPasswordValid2);
  console.log("isPasswordValid3 => ", isPasswordValid3);

  console.log(bcrypt.genSaltSync(10));
};

main();

// 実行するには以下のコマンドを使用してください。
// npx tsx .lab/bcrypt.ts
