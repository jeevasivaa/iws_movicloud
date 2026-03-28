import unittest

from rbac_cases import RBAC_MATRIX_OPS_ALERTS
from rbac_test_support import assert_rbac_matrix


class OpsAlertsRbacTest(unittest.TestCase):
    def test_ops_alerts_rbac_matrix(self):
        assert_rbac_matrix(self, RBAC_MATRIX_OPS_ALERTS)
