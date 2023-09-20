import { z } from "zod";
import { useForm } from ".";

const schema = z.object({
  test: z.coerce.number().max(10).optional(),
  array: z.array(
    z.object({
      testoa: z.coerce.string(),
      darr: z.array(z.object({ huhu: z.coerce.string() })),
    })
  ),
  object: z.object({
    testobj: z.coerce.number(),
  }),
});

function App() {
  const form = useForm(schema, (event) => {
    event.preventDefault();
    // console.log(event.data, event.success, event.error);
  });

  const value = form.watch(form.fields.test());

  return (
    <>
      <form ref={form.ref()} onSubmit={form.form().onSubmit}>
        <p>{form.errors.object().error()}</p>
        <input
          type="number"
          name={form.fields.test()}
          style={{ backgroundColor: "lightblue" }}
        />
        <input type="text" name={form.fields.object().testobj()} />
        {Array(5)
          .fill(null)
          .map((_, index) => {
            return (
              <div key={index}>
                {Array(5)
                  .fill(null)
                  .map((_, index2) => (
                    <input
                      key={index2 + "hi"}
                      type="text"
                      name={form.fields.array(index).darr(index2).huhu()}
                    />
                  ))}
                <input
                  style={{ backgroundColor: "gray" }}
                  type="text"
                  name={form.fields.array(index).testoa()}
                />
              </div>
            );
          })}
        <button type="submit">submit</button>
      </form>
    </>
  );
}

export default App;
