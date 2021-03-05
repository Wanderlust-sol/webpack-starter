module.exports = function myBabelPlugin() {
  return {
    // 커스텀 플러그인을 만들때에는 visitor라는 객체를 반환해줘야한다.
    visitor: {
      //   Identifier(path) {
      // const name = path.node.name;

      // // 바벨이 만든 AST 노드를 출력한다.
      // console.log("Identifier() name:", name);

      // // 변환작업: 코드 문자열을 역순으로 변환한다.
      // path.node.name = name
      //   .split("")
      //   .reverse()
      //   .join("");
      // }
      VariableDeclaration(path) {
        console.log("VariableDeclaration() kind:", path.node.kind); // const

        // const => bar 변환
        if (path.node.kind === "const") {
          path.node.kind = "var";
        }
      }
    }
  };
};
