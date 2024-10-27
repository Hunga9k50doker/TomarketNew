const app = require("../config/app");
const logger = require("../utils/logger");
const sleep = require("../utils/sleep");
const _ = require("lodash");
const fs = require("fs");
const colors = require("colors");

class ApiRequest {
  constructor(session_name, bot_name) {
    this.session_name = session_name;
    this.bot_name = bot_name;
    this.wallets = this.loadWallets("wallets.txt");
  }

  async get_user_data(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/user/balance`);
      return response.data;
    } catch (error) {
      const regex = /ENOTFOUND\s([^\s]+)/;
      const match = error.message.match(regex);
      logger.error(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while getting User Data: ${
          error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo") || error.message.includes("ECONNREFUSED")
            ? `The proxy server at ${match && match[1] ? match[1] : "unknown address"} could not be found. Please check the proxy address and your network connection`
            : error.message
        }`
      );
      await sleep(3); // Sleep for 3 seconds
    }
  }

  async validate_query_id(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/user/login`, JSON.stringify(data));
      if (response?.data?.status === 400 || response?.data?.message?.toLowerCase()?.includes("invalid init data")) {
        return false;
      }

      if (!_.isEmpty(response?.data?.data?.access_token)) {
        return true;
      }
      return false;
    } catch (error) {
      if (error?.response?.data?.message?.toLowerCase()?.includes("invalid init data signature") || error?.response?.status == 401) {
        return false;
      }

      throw error;
    }
  }

  async get_farm_info(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/farm/info`, data);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting farm info:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting farm info:</b>: ${error.message}`);
      }
    }
  }

  async start_farming(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/farm/start`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting farming:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting farming:</b>: ${error.message}`);
      }
    }
  }

  async start_game(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/game/play`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting game:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting game:</b>: ${error.message}`);
      }
    }
  }

  async claim_game_reward(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/game/claim`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming game reward:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming game reward:</b>: ${error.message}`);
      }
    }
  }

  async claim_daily_reward(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/daily/claim`, JSON.stringify({ game_id: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1" }));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming daily reward:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming daily reward:</b>: ${error.message}`);
      }
    }
  }

  async claim_farming_reward(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/farm/claim`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming farming reward:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming farming reward:</b>: ${error.message}`);
      }
    }
  }

  async claim_task(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/claim`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming task:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>claiming task:</b>: ${error.message}`);
      }
    }
  }

  async get_combo(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/hidden`);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting combo:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting combo:</b>: ${error.message}`);
      }
    }
  }

  async get_stars(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/classmateTask`);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting stars:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting stars:</b>: ${error.message}`);
      }
    }
  }

  async getPuzzle(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/puzzle`, JSON.stringify({ language_code: "en" }));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars get puzzle:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars get puzzle:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async claimPuzzle(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/puzzleClaim`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars claim puzzle:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars claim puzzle:</b>: ${error.message}`);
      }
      return null;
    }
  }

  ///handle wallets

  async loadWallets(file) {
    let wallets = [];
    wallets = fs.readFileSync(file, "utf-8").split("\n").filter(Boolean);
    if (wallets.length <= 0) {
      console.log(colors.red(`Không tìm thấy ví`));
      process.exit();
    } else {
      wallets = wallets.map((wallet) => `${this.session_name} | ${wallet}`);
    }
    return wallets;
  }

  async submitWalletAddress(http_client) {
    let walletAddress = this.wallets.find((wallet) => wallet.startsWith(this.session_name));
    if (!walletAddress) {
      console.log(colors.red(`Không tìm thấy địa chỉ ví cho ${this.session_name}`));
      return false;
    }

    walletAddress = walletAddress?.split(" | ")[1]?.trim();
    const data = JSON.stringify({ wallet_address: walletAddress });

    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const res = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/address`, JSON.stringify(data));
        console.log(res);
        if (res.status === 200 && res.data.status === 0 && res.data.data === "ok") {
          console.log(colors.green(`Liên kết ví thành công cho ${this.session_name}`));
          return true;
        } else if (res.status === 200 && res.data.message === "System error please wait") {
          console.log(colors.yellow(`Lỗi hệ thống, thử lại lần ${retries + 1} cho ${this.session_name}`));
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        } else if (res.status === 500) {
          if (res.data.message === "Verification failed, Ton address is not from Bitget Wallet") {
            console.log(colors.red(`Ví ton không được tạo từ bitget wallet cho ${this.session_name}`));
            return false;
          }
        }

        console.log(colors.red(`Gửi địa chỉ ví không thành công cho ${this.session_name}! Mã trạng thái: ${res.status}, Thông báo: ${res.data.message}`));
        return false;
      } catch (error) {
        console.log(colors.red(`Lỗi khi gửi địa chỉ ví cho ${this.session_name}: ${error.message}`));
        retries++;
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          return false;
        }
      }
    }

    console.log(colors.red(`Đã thử gửi địa chỉ ví ${maxRetries} lần không thành công cho ${this.session_name}`));
    return false;
  }

  async connectWallet(http_client) {
    try {
      const existingWalletAddress = await this.getWallets(http_client);
      if (!existingWalletAddress) {
        const walletSubmitted = await this.submitWalletAddress(http_client);
        if (!walletSubmitted) {
          console.log(colors.yellow(`Không thể gửi địa chỉ ví cho ${this.session_name}. Tiếp tục với các tác vụ khác.`));
        }
      } else {
        console.log(colors.yellow(`Địa chỉ ví đã tồn tại cho ${this.session_name}: ${existingWalletAddress}`));
      }
    } catch (error) {
      console.log(colors.red(`Lỗi khi xử lý wallet task cho ${this.session_name}: ${error.message}`));
    }
  }

  async saveWallet(val) {
    try {
      const data = fs.readFileSync("walletsConnected.txt", "utf-8").split("\n").filter(Boolean);
      if (!data.includes(val)) {
        const newItem = `\n${this.session_name} | ${val}`;
        fs.appendFileSync("walletsConnected.txt", newItem);
      }
    } catch (err) {
      console.error("Không thể xử lý file:", err);
    }
  }

  async getWallets(http_client) {
    try {
      const res = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/walletTask`, {});
      // console.log(res.data.data.walletAddress);
      if (res?.data?.data?.walletAddress) {
        await this.saveWallet(res.data.data.walletAddress);
        return res?.data?.data?.walletAddress;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async start_stars_claim(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/tasks/classmateStars`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars claim:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>starting stars claim:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async get_rank_data(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/rank/data`);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting rank data:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting rank data:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async evaluate_rank_data(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/rank/evaluate`);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>evaluate rank data:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>evaluate rank data:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async create_rank_data(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/rank/create`);
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>create rank:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>create rank:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async upgrade_rank(http_client, data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/rank/upgrade`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>upgrade rank:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>upgrade rank:</b>: ${error.message}`);
      }
      return null;
    }
  }

  async get_tickets(http_client, init_data) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/user/tickets`, JSON.stringify({ language_code: "en", init_data }));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting tickets:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting tickets:</b> ${error.message}`);
      }
      return null;
    }
  }

  async spin(http_client) {
    try {
      const response = await http_client.post(`${app.apiUrl}/tomarket-game/v1/spin/raffle`, JSON.stringify({ category: "ticket_spin_1" }));
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>spinning:</b> ${error?.response?.data?.message}`);
      } else {
        logger.error(`<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>spinning:</b> ${error.message}`);
      }
      return null;
    }
  }
}

module.exports = ApiRequest;
