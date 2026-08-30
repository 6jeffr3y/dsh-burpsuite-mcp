import inspect
import os
import unittest
from unittest.mock import patch

import server


class ServerContractTest(unittest.TestCase):
    def test_bridge_url_prefers_explicit_environment_value(self) -> None:
        with patch.dict(os.environ, {"BURP_MCP_BRIDGE_URL": "http://127.0.0.1:9999/"}):
            self.assertEqual(server.resolve_bridge_base(), "http://127.0.0.1:9999")

    def test_endpoint_normalization_replaces_unstable_identifiers(self) -> None:
        self.assertEqual(
            server._normalize_endpoint_path("/api/users/123/550e8400-e29b-41d4-a716-446655440000"),
            "/api/users/{int}/{uuid}",
        )

    def test_source_parser_rejects_unknown_buffers(self) -> None:
        with self.assertRaisesRegex(ValueError, "未知值"):
            server._parse_source_csv("history,unknown")

    def test_code_import_tools_keep_string_defaults(self) -> None:
        bcheck = inspect.signature(server.burp_bcheck_import)
        bambda = inspect.signature(server.burp_bambda_import)
        self.assertEqual(bcheck.parameters["content"].default, "")
        self.assertEqual(bcheck.parameters["path"].default, "")
        self.assertEqual(bambda.parameters["content"].default, "")
        self.assertEqual(bambda.parameters["path"].default, "")


if __name__ == "__main__":
    unittest.main()
