import * as fs from "node:fs/promises";
import * as path from "node:path";

import generateFlowChart from "../index.js";

it("petstore", async () => {
  const filepath = path.join(__dirname, "../__fixtures__/petstore.yaml");
  await expect(generateFlowChart(await fs.readFile(filepath, "utf8"), filepath))
    .resolves.toEqual(`flowchart LR
  subgraph A ["Login User and then retrieve pets"]
    B[GET /user/login?username=$inputs.username&password=$inputs.password]
    B -- "if $statusCode == 200" -->C
    C[GET /pet/findByStatus?status=available<br>-H Authorization: $steps.loginUser.outputs.sessionToken]
    C -- "if $statusCode == 200" -->END
  end`);
});

it("petstore_extended", async () => {
  const filepath = path.join(
    __dirname,
    "../__fixtures__/petstore_extended.yaml",
  );
  await expect(generateFlowChart(await fs.readFile(filepath, "utf8"), filepath))
    .resolves.toEqual(`flowchart LR
  subgraph A ["Login User"]
    B[GET /user/login?username=$inputs.username&password=$inputs.password]
    B -- "if $statusCode == 200" -->END
  end
  subgraph C ["Login User and then order a toy"]
    A -->D
    D[POST /store/order<br>-H Authorization: $steps.loginUser.outputs.sessionToken]
    D -- "if $statusCode == 201" -->END
  end
  subgraph E ["Login User and then retrieve pets"]
    A -->F
    F[GET /pet/findByStatus?status=available<br>-H Authorization: $steps.loginUser.outputs.sessionToken]
    F -- "if $statusCode == 200" -->G
    G["Success"] -- "if $response.body.kind matches ^(dog|cat)$ and $response.body.name matches ^[a-c]" -->C
  end`);
});
