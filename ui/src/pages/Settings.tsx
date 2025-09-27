import Card from '../components/Card'
import { Field, Select, TextInput } from '../components/Field'

export default function Settings() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <div className="text-white font-semibold">Network</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Field label="Preferred chain">
            <Select defaultValue="sepolia">
              <option value="sepolia">Sepolia</option>
              <option value="base">Base</option>
              <option value="arbitrum">Arbitrum</option>
            </Select>
          </Field>
          <Field label="RPC (optional)">
            <TextInput placeholder="https://..." />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="text-white font-semibold">Display</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Field label="Currency format">
            <Select defaultValue="usd">
              <option value="usd">USD</option>
              <option value="native">Native</option>
            </Select>
          </Field>
          <Field label="Theme">
            <Select defaultValue="dark">
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </Field>
        </div>
      </Card>
    </div>
  )
}
